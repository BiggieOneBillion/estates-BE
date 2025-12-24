// src/events/events.service.ts
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface SocketClient {
  userId: string;
  socket: Socket;
}

@Injectable()
export class EventsService {
  private clients: SocketClient[] = [];

  addClient(userId: string, socket: Socket) {
    this.clients.push({ userId, socket });
  }

  removeClient(socket: Socket) {
    this.clients = this.clients.filter((c) => c.socket.id !== socket.id);
  }

  sendToUser(userId: string, event: string, payload: any) {
    console.log('From socket connection', payload);
    console.log("USER ID", userId)
 console.log("ALL SOCKET CLIENTS------------", this.clients)
    this.clients
      .filter((c) => c.userId.toString() === userId.toString())
      .forEach((c) => c.socket.emit(event, payload));
  }

  broadcast(event: string, payload: any) {
    this.clients.forEach((c) => c.socket.emit(event, payload));
  }
}
