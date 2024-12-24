import { WebSocketServer, WebSocket } from 'ws';
import { NetworkServiceStatus } from '../shared/model'
import { config } from 'dotenv';
import { readFile, watch } from 'fs';
import { exec } from "child_process";
import { send } from 'process';

config();

let cachedNetworkStatus: NetworkServiceStatus = "disconnected";
const PORT: number = parseInt(process.env.PORT!);
const NETWORK_SERVICE_NAME: string = process.env.NETWORK_SERVICE_NAME!;

export interface ToggleNetworkConnection {
  type: 'toggleNetworkConnection';
}

export type ClientMessage = ToggleNetworkConnection;

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface NetworkStatusMessage {
  type: 'networkStatus';
  status: NetworkServiceStatus;
}

export type ServerMessage = ErrorMessage | NetworkStatusMessage;

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  sendNetworkStatus(ws, cachedNetworkStatus);

  ws.on('message', async (data: string) => {
    try {
      const message: ClientMessage = JSON.parse(data);

      if (message.type === 'toggleNetworkConnection') {
        updateServiceStatus(ws, cachedNetworkStatus === 'connected' ? 'disconnecting' : 'connecting');
      }
      else {
        sendError(ws, 'Unknown message type');
      }
    } catch (error) {
      sendError(ws, 'Failed to parse message');
    }
  });
});

function sendError(ws: WebSocket, message: string): void {
  const errorMessage: ErrorMessage = { type: 'error', message };
  ws.send(JSON.stringify(errorMessage));
}

function broadcastNetworkStatus(status: NetworkServiceStatus): void {
  const message: NetworkStatusMessage = { type: 'networkStatus', status };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function sendNetworkStatus(ws: WebSocket, status: NetworkServiceStatus): void {
  const message: NetworkStatusMessage = { type: 'networkStatus', status };
  console.log('Sending network status:', message);
  ws.send(JSON.stringify(message));
}

const updateServiceStatus = async (ws: WebSocket, status: NetworkServiceStatus) => {
  const networkServiceName = NETWORK_SERVICE_NAME;
  const command =
    status === "connecting"
      ? `/usr/sbin/networksetup -connectpppoeservice "${networkServiceName}"`
      : `/usr/sbin/networksetup -disconnectpppoeservice "${networkServiceName}"`;

  try {
    await execPromise(command);
    cachedNetworkStatus = status;
    sendNetworkStatus(ws, status);
    const updatedStatus = await waitForFinalServiceStatus(networkServiceName);
    cachedNetworkStatus = updatedStatus;
    sendNetworkStatus(ws, updatedStatus);
  } catch (err) {
    console.error(`Error updating service status for ${networkServiceName}:`, err);
    sendError(ws, 'Failed to update service status');
  }
};

const waitForFinalServiceStatus = (serviceName: string) =>
  new Promise<NetworkServiceStatus>((resolve) => {
    const checkStatus = async () => {
      try {
        const status = await showPPPoEStatus(serviceName);

        if (status === "connected" || status === "disconnected") {
          resolve(status);
        } else {
          setTimeout(checkStatus, 500);
        }
      } catch (err) {
        console.error(`Error checking final status for ${NETWORK_SERVICE_NAME}:`, err);
        setTimeout(checkStatus, 500);
      }
    };

    checkStatus();
  });

const showPPPoEStatus = (networkServiceName: string): Promise<NetworkServiceStatus> => {
  return execPromise(
    `/usr/sbin/networksetup -showpppoestatus "${networkServiceName}"`,
  ) as Promise<NetworkServiceStatus>;
};

const execPromise = (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error executing command: ${command}`, err);
        reject(err);
      } else if (stderr) {
        console.warn(`Command stderr: ${stderr}`);
        resolve(stdout.trim());
      } else {
        resolve(stdout.trim());
      }
    });

    // Ensure the child process is cleaned up
    child.on("exit", (code) => {
      console.log(`Command exited with code: ${code}`);
    });

    child.on("error", (err) => {
      console.error(`Failed to start command: ${command}`, err);
      reject(err);
    });
  });

// VPN status watcher

const filePath = process.env.FILE_PATH;

const readLastLine = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      const lines = data.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      resolve(lastLine);
    });
  });
};

watch(filePath!, async (eventType, filename) => {
      let newStatus: NetworkServiceStatus = "invalid";
  if (eventType === 'change') {
    try {
      const lastLine = await readLastLine(filePath!);
      if (lastLine === 'VPN is connected') {
        newStatus = 'connected';
      } else if (lastLine === 'VPN is disconnected') {
        newStatus = 'disconnected';
      } else {
        newStatus = 'invalid';
      }
    } catch (err) {
      newStatus = "invalid";
    }

    if (newStatus !== cachedNetworkStatus) {
      cachedNetworkStatus = newStatus;
      broadcastNetworkStatus(newStatus);
    }
  }
});