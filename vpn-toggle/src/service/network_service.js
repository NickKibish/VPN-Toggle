import { WebSocket } from 'ws';
export class NetworkServiceManager {
    port;
    ws;
    async connect(port) {
        this.port = port;
        this.ws = new WebSocket(`ws://localhost:${port}`);
    }
}
