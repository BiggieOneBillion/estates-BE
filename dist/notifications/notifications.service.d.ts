import { Model } from 'mongoose';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private notificationModel;
    constructor(notificationModel: Model<Notification>);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    createTokenNotification(userId: string, tokenId: string, tokenValue: string, type: NotificationType, isVisitorIdVerified?: boolean): Promise<Notification>;
    findAll(): Promise<Notification[]>;
    findAllByUser(userId: string): Promise<Notification[]>;
    findUnreadByUser(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
}
