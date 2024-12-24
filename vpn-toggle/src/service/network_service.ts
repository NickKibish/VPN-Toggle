import { NetworkServiceStatus } from '../../../shared/model';
import { ServerMessage, ClientMessage } from '../../../server/server'
import { WebSocket } from 'ws';
import { streamDeck } from '@elgato/streamdeck';

export class NetworkServiceManager {
    private ws: WebSocket | undefined;
    private statusCallback?: (status: NetworkServiceStatus) => void;
    private PORT: number;

    constructor() {
        this.PORT = 8080;
        this.open();
    }

    public setStatusCallback(callback: (status: NetworkServiceStatus) => void): void {
        this.statusCallback = callback;
        streamDeck.logger.info('WS Callback set');
    }

    public open(): void {
        this.ws = new WebSocket(`ws://localhost:${this.PORT}`);
        this.ws.onopen = () => {
            streamDeck.logger.info('WS Web socket connected');
        }
        this.ws.on('message', (data) => {
            const serverMessage = JSON.parse(data.toString()) as ServerMessage;
            streamDeck.logger.info('WS Network status changed:', 'message received' + serverMessage.type);
            if (serverMessage.type === 'networkStatus' && this.statusCallback) {
                this.statusCallback(serverMessage.status);
                streamDeck.logger.info('WS Network status changed:', serverMessage.status);
            }
        });
    }

    public close(): void {
        this.ws?.close();
    }

    public toggleConnection(): void {
        const message: ClientMessage = { type: 'toggleNetworkConnection' };
        this.ws?.send(JSON.stringify(message));
    }

}