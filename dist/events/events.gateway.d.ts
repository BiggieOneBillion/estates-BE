import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EventsService } from './events.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly eventsService;
    private readonly jwtService;
    private readonly usersService;
    constructor(eventsService: EventsService, jwtService: JwtService, usersService: UsersService);
    handleConnection(socket: Socket): Promise<void>;
    handleDisconnect(socket: Socket): void;
    handlePing(socket: Socket, data: any): void;
}
