"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = exports.QueryHandlers = exports.CommandHandlers = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cqrs_1 = require("@nestjs/cqrs");
const notifications_service_1 = require("./notifications.service");
const notifications_controller_1 = require("./notifications.controller");
const notification_entity_1 = require("./entities/notification.entity");
const push_notification_service_1 = require("./push-notification.service");
const create_notification_handler_1 = require("./cqrs/commands/handlers/create-notification.handler");
const create_token_notification_handler_1 = require("./cqrs/commands/handlers/create-token-notification.handler");
const mark_notification_as_read_handler_1 = require("./cqrs/commands/handlers/mark-notification-as-read.handler");
const mark_all_notifications_as_read_handler_1 = require("./cqrs/commands/handlers/mark-all-notifications-as-read.handler");
const find_notifications_by_user_handler_1 = require("./cqrs/queries/handlers/find-notifications-by-user.handler");
const find_unread_notifications_by_user_handler_1 = require("./cqrs/queries/handlers/find-unread-notifications-by-user.handler");
exports.CommandHandlers = [
    create_notification_handler_1.CreateNotificationHandler,
    create_token_notification_handler_1.CreateTokenNotificationHandler,
    mark_notification_as_read_handler_1.MarkNotificationAsReadHandler,
    mark_all_notifications_as_read_handler_1.MarkAllNotificationsAsReadHandler,
];
exports.QueryHandlers = [
    find_notifications_by_user_handler_1.FindNotificationsByUserHandler,
    find_unread_notifications_by_user_handler_1.FindUnreadNotificationsByUserHandler,
];
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            mongoose_1.MongooseModule.forFeature([{ name: notification_entity_1.Notification.name, schema: notification_entity_1.NotificationSchema }]),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [
            notifications_service_1.NotificationsService,
            push_notification_service_1.PushNotificationService,
            ...exports.CommandHandlers,
            ...exports.QueryHandlers,
        ],
        exports: [notifications_service_1.NotificationsService, push_notification_service_1.PushNotificationService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map