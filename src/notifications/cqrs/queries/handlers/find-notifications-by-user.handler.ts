import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindNotificationsByUserQuery } from '../impl/notification-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../../entities/notification.entity';
import { plainToInstance } from 'class-transformer';
import { NotificationResponseDto } from '../../../dto/response/notification.response.dto';

@QueryHandler(FindNotificationsByUserQuery)
export class FindNotificationsByUserHandler implements IQueryHandler<FindNotificationsByUserQuery> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async execute(query: FindNotificationsByUserQuery): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationModel
      .find({ user: query.userId })
      .sort({ createdAt: -1 })
      .exec();

    return notifications.map(notification => 
      plainToInstance(NotificationResponseDto, notification.toObject(), { excludeExtraneousValues: true })
    );
  }
}
