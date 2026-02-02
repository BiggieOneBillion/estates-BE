import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterFcmTokenCommand } from '../impl/register-fcm-token.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(RegisterFcmTokenCommand)
export class RegisterFcmTokenHandler implements ICommandHandler<RegisterFcmTokenCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: RegisterFcmTokenCommand): Promise<User> {
    const { userId, fcmToken } = command;
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    return user;
  }
}
