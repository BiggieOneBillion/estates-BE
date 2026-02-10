import { CreateNotificationHandler } from './cqrs/commands/handlers/create-notification.handler';
import { CreateTokenNotificationHandler } from './cqrs/commands/handlers/create-token-notification.handler';
import { MarkNotificationAsReadHandler } from './cqrs/commands/handlers/mark-notification-as-read.handler';
import { MarkAllNotificationsAsReadHandler } from './cqrs/commands/handlers/mark-all-notifications-as-read.handler';
import { FindNotificationsByUserHandler } from './cqrs/queries/handlers/find-notifications-by-user.handler';
import { FindUnreadNotificationsByUserHandler } from './cqrs/queries/handlers/find-unread-notifications-by-user.handler';
export declare const CommandHandlers: (typeof CreateNotificationHandler | typeof CreateTokenNotificationHandler | typeof MarkNotificationAsReadHandler | typeof MarkAllNotificationsAsReadHandler)[];
export declare const QueryHandlers: (typeof FindNotificationsByUserHandler | typeof FindUnreadNotificationsByUserHandler)[];
export declare class NotificationsModule {
}
