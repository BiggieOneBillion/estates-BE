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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    findAllForUser(req) {
        return this.notificationsService.findAllByUser(req.user.userId);
    }
    findUnreadForUser(req) {
        return this.notificationsService.findUnreadByUser(req.user.userId);
    }
    markAsRead(id) {
        return this.notificationsService.markAsRead(id);
    }
    markAllAsRead(req) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get all user notifications',
        description: 'Retrieves a complete list of notifications for the currently authenticated user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of notifications retrieved successfully' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAllForUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get unread notifications',
        description: 'Retrieves only the unread notifications for the currently authenticated user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of unread notifications retrieved' }),
    (0, common_1.Get)('unread'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findUnreadForUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Mark notification as read',
        description: 'Updates the status of a specific notification to read.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    (0, common_1.Post)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Mark all notifications as read',
        description: 'Updates all notifications for the currently authenticated user to read status.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications successfully marked as read' }),
    (0, common_1.Post)('read-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map