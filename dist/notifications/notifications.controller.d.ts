import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotificationResponseDto } from './dto/response/notification.response.dto';
export declare class NotificationsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    findAllForUser(req: any): Promise<NotificationResponseDto[]>;
    findUnreadForUser(req: any): Promise<NotificationResponseDto[]>;
    markAsRead(id: string): Promise<any>;
    markAllAsRead(req: any): Promise<any>;
}
