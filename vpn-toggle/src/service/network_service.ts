import { NetworkService, NetworkServiceStatus } from '../../../shared/model';
import { WebSocket } from 'ws';

export class NetworkServiceManager {
    private host?: string;
    private port?: number;
    private ws?: WebSocket;

    async connect(host: string, port: number): Promise<void> {
        this.host = host;
        this.port = port;
        this.ws = new WebSocket(`ws://${host}:${port}`);
    }
}