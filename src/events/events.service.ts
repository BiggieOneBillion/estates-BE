import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

interface SocketClient {
  userId: string;
  socket: Socket;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private clients: SocketClient[] = [];

  addClient(userId: string, socket: Socket) {
    this.clients.push({ userId, socket });
  }

  removeClient(socket: Socket) {
    this.clients = this.clients.filter((c) => c.socket.id !== socket.id);
  }

  sendToUser(userId: string, event: string, payload: any) {
    this.logger.debug(`Sending event ${event} to user ${userId}`);
    this.clients
      .filter((c) => c.userId.toString() === userId.toString())
      .forEach((c) => c.socket.emit(event, payload));
  }

  broadcast(event: string, payload: any) {
    this.logger.debug(`Broadcasting event ${event}`);
    this.clients.forEach((c) => c.socket.emit(event, payload));
  }
}
