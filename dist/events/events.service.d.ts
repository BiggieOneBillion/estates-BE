import { Socket } from 'socket.io';
export declare class EventsService {
    private clients;
    addClient(userId: string, socket: Socket): void;
    removeClient(socket: Socket): void;
    sendToUser(userId: string, event: string, payload: any): void;
    broadcast(event: string, payload: any): void;
}
