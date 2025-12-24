import { NotificationType } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    user: string;
    type: NotificationType;
    message: string;
    data?: any;
    read?: boolean;
}
