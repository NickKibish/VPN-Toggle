import { NetworkService, NetworkServiceStatus } from '../../../shared/model';
import { WebSocket } from 'ws';

export class NetworkServiceManager {
    private port?: number;
    private ws?: WebSocket;

    async connect(port: number): Promise<void> {
        this.port = port;
        this.ws = new WebSocket(`ws://localhost:${port}`);
    }
}