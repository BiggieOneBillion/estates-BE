"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
let EventsService = class EventsService {
    clients = [];
    addClient(userId, socket) {
        this.clients.push({ userId, socket });
    }
    removeClient(socket) {
        this.clients = this.clients.filter((c) => c.socket.id !== socket.id);
    }
    sendToUser(userId, event, payload) {
        console.log('From socket connection', payload);
        console.log("USER ID", userId);
        console.log("ALL SOCKET CLIENTS------------", this.clients);
        this.clients
            .filter((c) => c.userId.toString() === userId.toString())
            .forEach((c) => c.socket.emit(event, payload));
    }
    broadcast(event, payload) {
        this.clients.forEach((c) => c.socket.emit(event, payload));
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)()
], EventsService);
//# sourceMappingURL=events.service.js.map