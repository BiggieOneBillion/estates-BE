import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyEmailCommand } from '../impl/verify-email.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { BadRequestException, Logger } from '@nestjs/common';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  private readonly logger = new Logger(VerifyEmailHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<any> {
    const { email, code } = command;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new BadRequestException('Email does not exist');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (code !== user.verificationToken) {
      throw new BadRequestException('Incorrect Token');
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();

    return {
      message: 'Email Verification Successful',
      status: 200,
    };
  }
}
