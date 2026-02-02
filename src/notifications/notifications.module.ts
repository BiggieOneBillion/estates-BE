import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { PushNotificationService } from './push-notification.service';

import { CreateNotificationHandler } from './cqrs/commands/handlers/create-notification.handler';
import { CreateTokenNotificationHandler } from './cqrs/commands/handlers/create-token-notification.handler';
import { MarkNotificationAsReadHandler } from './cqrs/commands/handlers/mark-notification-as-read.handler';
import { MarkAllNotificationsAsReadHandler } from './cqrs/commands/handlers/mark-all-notifications-as-read.handler';
import { FindNotificationsByUserHandler } from './cqrs/queries/handlers/find-notifications-by-user.handler';
import { FindUnreadNotificationsByUserHandler } from './cqrs/queries/handlers/find-unread-notifications-by-user.handler';

export const CommandHandlers = [
  CreateNotificationHandler,
  CreateTokenNotificationHandler,
  MarkNotificationAsReadHandler,
  MarkAllNotificationsAsReadHandler,
];

export const QueryHandlers = [
  FindNotificationsByUserHandler,
  FindUnreadNotificationsByUserHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService, 
    PushNotificationService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [NotificationsService, PushNotificationService],
})
export class NotificationsModule {}