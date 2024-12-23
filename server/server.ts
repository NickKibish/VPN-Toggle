import { WebSocketServer, WebSocket } from 'ws';
import { NetworkService, NetworkServiceStatus } from '../shared/model'
import { getNetworks } from './networks_service';
import { config } from 'dotenv';
import { readFile, watch } from 'fs';

config();

let cachedNetworkStatus: NetworkServiceStatus = "disconnected";
const PORT: number = parseInt(process.env.PORT!);

export interface ConnectNetworkMessage {
  type: 'connectNetwork';
  connect: boolean;
}

export type ClientMessage = ConnectNetworkMessage;

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

      if (message.type === 'connectNetwork') {
        
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
  ws.send(JSON.stringify(message));
}

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

const watcher = watch(filePath!, async (eventType, filename) => {
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