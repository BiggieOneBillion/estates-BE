import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateNotificationPreferencesCommand } from '../impl/update-notification-preferences.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateNotificationPreferencesCommand)
export class UpdateNotificationPreferencesHandler implements ICommandHandler<UpdateNotificationPreferencesCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: UpdateNotificationPreferencesCommand): Promise<User> {
    const { userId, preferences } = command;
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const currentPrefs = user.notificationPreferences || { email: true, push: true, sms: false };
    user.notificationPreferences = {
      email: preferences.email !== undefined ? preferences.email : currentPrefs.email,
      push: preferences.push !== undefined ? preferences.push : currentPrefs.push,
      sms: preferences.sms !== undefined ? preferences.sms : currentPrefs.sms,
    };

    await user.save();
    return user;
  }
}
