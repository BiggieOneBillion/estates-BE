import { OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventsService } from './events.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly eventsService;
    private readonly jwtService;
    private readonly usersService;
    server: Server;
    private readonly logger;
    constructor(eventsService: EventsService, jwtService: JwtService, usersService: UsersService);
    onModuleInit(): void;
    handleConnection(socket: Socket): Promise<void>;
    handleDisconnect(socket: Socket): void;
    handlePing(socket: Socket, data: any): void;
}
