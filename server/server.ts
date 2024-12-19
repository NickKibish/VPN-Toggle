import { WebSocketServer, WebSocket } from 'ws';
import { NetworkService } from '../shared/model'
import { getNetworks } from './networks_service';

interface ListNetworksMessage {
  type: 'listNetworks';
}

interface ConnectNetworkMessage {
  type: 'connectNetwork';
  networkId: string;
}

type ClientMessage = ListNetworksMessage | ConnectNetworkMessage;

interface ErrorMessage {
  type: 'error';
  message: string;
}

interface NetworksMessage {
  type: 'networks';
  data: NetworkService[];
}

interface SuccessMessage {
  type: 'success';
  message: string;
}

type ServerMessage = ErrorMessage | NetworksMessage | SuccessMessage;

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    ws.on('message', async (data: string) => {
        try {
            const message: ClientMessage = JSON.parse(data);

            if (message.type === 'listNetworks') {
                const networks: NetworkService[] = await getNetworks();
                const response: NetworksMessage = { type: 'networks', data: networks };
                ws.send(JSON.stringify(response));
            } else if (message.type === 'connectNetwork') {
        
            } else {
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