import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveFcmTokenCommand } from '../impl/remove-fcm-token.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(RemoveFcmTokenCommand)
export class RemoveFcmTokenHandler implements ICommandHandler<RemoveFcmTokenCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: RemoveFcmTokenCommand): Promise<User> {
    const { userId, fcmToken } = command;
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.fcmTokens) {
      user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken);
      await user.save();
    }

    return user;
  }
}
