import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUnreadNotificationsByUserQuery } from '../impl/notification-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../../entities/notification.entity';

@QueryHandler(FindUnreadNotificationsByUserQuery)
export class FindUnreadNotificationsByUserHandler implements IQueryHandler<FindUnreadNotificationsByUserQuery> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async execute(query: FindUnreadNotificationsByUserQuery): Promise<Notification[]> {
    return this.notificationModel
      .find({ user: query.userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
  }
}
