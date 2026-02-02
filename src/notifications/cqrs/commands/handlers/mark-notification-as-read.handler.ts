import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkNotificationAsReadCommand } from '../impl/notification-commands.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../../entities/notification.entity';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(MarkNotificationAsReadCommand)
export class MarkNotificationAsReadHandler implements ICommandHandler<MarkNotificationAsReadCommand> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async execute(command: MarkNotificationAsReadCommand): Promise<Notification> {
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(command.id, { read: true, readAt: new Date() }, { new: true })
      .exec();

    if (!updatedNotification) {
      throw new NotFoundException('Notification not found');
    }

    return updatedNotification;
  }
}
