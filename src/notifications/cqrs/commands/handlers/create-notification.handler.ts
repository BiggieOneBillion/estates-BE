import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNotificationCommand } from '../impl/notification-commands.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../../entities/notification.entity';

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler implements ICommandHandler<CreateNotificationCommand> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async execute(command: CreateNotificationCommand): Promise<Notification> {
    const newNotification = new this.notificationModel(command.createNotificationDto);
    return newNotification.save();
  }
}
