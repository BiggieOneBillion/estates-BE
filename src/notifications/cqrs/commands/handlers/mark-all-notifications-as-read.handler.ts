import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkAllNotificationsAsReadCommand } from '../impl/notification-commands.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../../entities/notification.entity';

@CommandHandler(MarkAllNotificationsAsReadCommand)
export class MarkAllNotificationsAsReadHandler implements ICommandHandler<MarkAllNotificationsAsReadCommand> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async execute(command: MarkAllNotificationsAsReadCommand): Promise<void> {
    await this.notificationModel
      .updateMany(
        { user: command.userId, read: false },
        { read: true, readAt: new Date() },
      )
      .exec();
  }
}
