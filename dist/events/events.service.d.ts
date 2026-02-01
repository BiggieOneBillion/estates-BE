import { Server } from 'socket.io';
export declare class EventsService {
    private readonly logger;
    private server;
    setServer(server: Server): void;
    sendToUser(userId: string, event: string, payload: any): void;
    broadcast(event: string, payload: any): void;
}
