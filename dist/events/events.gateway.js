"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const events_service_1 = require("./events.service");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    eventsService;
    jwtService;
    usersService;
    server;
    logger = new common_1.Logger(EventsGateway_1.name);
    constructor(eventsService, jwtService, usersService) {
        this.eventsService = eventsService;
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    onModuleInit() {
        this.eventsService.setServer(this.server);
    }
    async handleConnection(socket) {
        try {
            const userId = socket.handshake.query.userId;
            let token = socket.handshake.headers.authorization;
            if (!token) {
                socket.emit('error', { message: 'No token provided' });
                socket.disconnect();
                return;
            }
            if (token.startsWith('Bearer ')) {
                token = token.substring(7);
            }
            const payload = this.jwtService.verify(token);
            if (!payload) {
                socket.emit('error', { message: 'Invalid token' });
                socket.disconnect();
                return;
            }
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                socket.emit('error', { message: 'User not found' });
                socket.disconnect();
                return;
            }
            if (userId && userId !== payload.sub) {
                socket.emit('error', { message: 'User ID mismatch' });
                socket.disconnect();
                return;
            }
            socket.join(`user_${payload.sub}`);
            this.logger.log(`User ${payload.sub} connected and joined room user_${payload.sub}`);
            socket.emit('connected', { message: `Connected as ${payload.sub}` });
        }
        catch (error) {
            this.logger.error(`WebSocket connection error: ${error.message}`);
            socket.emit('error', { message: 'Authentication failed' });
            socket.disconnect();
        }
    }
    handleDisconnect(socket) {
        this.logger.log(`Client disconnected: ${socket.id}`);
    }
    handlePing(socket, data) {
        socket.emit('pong', { message: 'pong' });
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handlePing", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map