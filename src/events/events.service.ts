import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  sendToUser(userId: string, event: string, payload: any) {
    if (!this.server) {
      this.logger.warn('Socket server not initialized in EventsService');
      return;
    }
    this.logger.debug(`Sending event ${event} to user ${userId}`);
    this.server.to(`user_${userId}`).emit(event, payload);
  }

  broadcast(event: string, payload: any) {
    if (!this.server) {
      this.logger.warn('Socket server not initialized in EventsService');
      return;
    }
    this.logger.debug(`Broadcasting event ${event}`);
    this.server.emit(event, payload);
  }
}
