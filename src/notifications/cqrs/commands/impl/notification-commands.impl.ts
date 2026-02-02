import { CreateNotificationDto } from '../../../dto/create-notification.dto';
import { NotificationType } from '../../../entities/notification.entity';

export class CreateNotificationCommand {
  constructor(public readonly createNotificationDto: CreateNotificationDto) {}
}

export class CreateTokenNotificationCommand {
  constructor(
    public readonly userId: string,
    public readonly tokenId: string,
    public readonly tokenValue: string,
    public readonly type: NotificationType,
    public readonly isVisitorIdVerified?: boolean,
  ) {}
}

export class MarkNotificationAsReadCommand {
  constructor(public readonly id: string) {}
}

export class MarkAllNotificationsAsReadCommand {
  constructor(public readonly userId: string) {}
}
