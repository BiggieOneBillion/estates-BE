// src/events/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EventsService } from './events.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const userId = socket.handshake.query.userId as string;
      let token = socket.handshake.headers.authorization;
      
      // Check if token exists
      if (!token) {
        socket.emit('error', { message: 'No token provided' });
        socket.disconnect();
        return;
      }
      
      // Remove Bearer prefix if present
      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }
      
      // Verify the token
      const payload = this.jwtService.verify(token);
      if (!payload) {
        socket.emit('error', { message: 'Invalid token' });
        socket.disconnect();
        return;
      }
      
      // Check if user exists
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        socket.disconnect();
        return;
      }
      
      // Check if userId from query matches the user ID from token
      if (userId && userId !== payload.sub) {
        socket.emit('error', { message: 'User ID mismatch' });
        socket.disconnect();
        return;
      }
      
      // If all checks pass, add client
      this.eventsService.addClient(payload.sub, socket);
      socket.emit('connected', { message: `Connected as ${payload.sub}` });
    } catch (error) {
      console.error('WebSocket connection error:', error.message);
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.eventsService.removeClient(socket);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    socket.emit('pong', { message: 'pong' });
  }
}