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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationsService = class NotificationsService {
    notificationModel;
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    async create(createNotificationDto) {
        const newNotification = new this.notificationModel(createNotificationDto);
        return newNotification.save();
    }
    async createTokenNotification(userId, tokenId, tokenValue, type, isVisitorIdVerified) {
        let message = '';
        switch (type) {
            case notification_entity_1.NotificationType.VERIFY_VISTOR:
                message = `Please verify the visitor id with this token ${tokenValue}`;
                break;
            case notification_entity_1.NotificationType.VISITOR_VERIFIED:
                message = `Visitor has been verify for this token ${tokenValue}`;
                break;
            case notification_entity_1.NotificationType.TOKEN_UPDATED:
                if (isVisitorIdVerified) {
                    message = `Please verify the visitor id with this token ${tokenValue}`;
                }
                else {
                    message = `Your token ${tokenValue} has been updated`;
                }
                break;
            case notification_entity_1.NotificationType.TOKEN_VERIFIED:
                message = `Your token ${tokenValue} has been verified`;
                break;
            case notification_entity_1.NotificationType.TOKEN_EXPIRED:
                message = `Your token ${tokenValue} has expired`;
                break;
        }
        const notification = {
            user: userId,
            type,
            message,
            data: { tokenId, tokenValue },
            read: false,
        };
        return this.create(notification);
    }
    async findAll() {
        return this.notificationModel.find().exec();
    }
    async findAllByUser(userId) {
        return this.notificationModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findUnreadByUser(userId) {
        return this.notificationModel
            .find({ user: userId, read: false })
            .sort({ createdAt: -1 })
            .exec();
    }
    async markAsRead(id) {
        const updatedNotification = await this.notificationModel
            .findByIdAndUpdate(id, { read: true, readAt: new Date() }, { new: true })
            .exec();
        if (!updatedNotification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return updatedNotification;
    }
    async markAllAsRead(userId) {
        await this.notificationModel
            .updateMany({ user: userId, read: false }, { read: true, readAt: new Date() })
            .exec();
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_entity_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map