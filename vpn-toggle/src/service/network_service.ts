import { NetworkService, NetworkServiceStatus } from '../../../shared/model';
import { WebSocket } from 'ws';
import { ListenNetworkStatusMessage, ServerMessage } from '../../../server/server';
export class NetworkServiceManager {
    private port?: number;
    private ws?: WebSocket;

    connectIfNeeded(port: number): void {
        if (!this.ws) {
            this.port = port;
            this.connect();
        } else if (this.ws && this.port !== port) {
            this.ws.close();
            this.port = port;
            this.connect();
        } else {
            console.log('Already connected');
        }
    }

    private connect(): void {
        this.ws = new WebSocket(`ws://localhost:${this.port}`);
        this.ws.on('open', () => {
            console.log('Connected to server');
        });
        this.ws.on('message', (data) => {
            console.log(data);
        });
        this.ws.on('close', () => {
            console.log('Connection closed');
            this.ws = undefined;
        });
    }

    listenToNetworkStatus(networkId: string): void {
        if (!this.ws) {
            return;
        }
        
        const message: ListenNetworkStatusMessage = { type: 'listNetworkStatus', networkId };
        this.ws.send(JSON.stringify(message));

        this.ws.on('message', (data: string) => {
            try {
                const message: ListenNetworkStatusMessage = JSON.parse(data);
                if (message.type === 'listNetworkStatus') {
                    console.log(message.networkId);
                }
            } catch (e) {
                console.error(e);
            }

            console.log(data);
        });
    }
}