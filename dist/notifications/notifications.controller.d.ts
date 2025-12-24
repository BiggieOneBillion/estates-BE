import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAllForUser(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    findUnreadForUser(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    markAsRead(id: string): Promise<import("./entities/notification.entity").Notification | null>;
    markAllAsRead(req: any): Promise<void>;
}
