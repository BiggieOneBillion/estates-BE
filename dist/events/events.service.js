"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
let EventsService = EventsService_1 = class EventsService {
    logger = new common_1.Logger(EventsService_1.name);
    server;
    setServer(server) {
        this.server = server;
    }
    sendToUser(userId, event, payload) {
        if (!this.server) {
            this.logger.warn('Socket server not initialized in EventsService');
            return;
        }
        this.logger.debug(`Sending event ${event} to user ${userId}`);
        this.server.to(`user_${userId}`).emit(event, payload);
    }
    broadcast(event, payload) {
        if (!this.server) {
            this.logger.warn('Socket server not initialized in EventsService');
            return;
        }
        this.logger.debug(`Broadcasting event ${event}`);
        this.server.emit(event, payload);
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)()
], EventsService);
//# sourceMappingURL=events.service.js.map