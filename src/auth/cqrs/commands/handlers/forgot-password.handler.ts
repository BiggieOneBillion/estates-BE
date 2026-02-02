import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../impl/forgot-password.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { BadRequestException, Logger } from '@nestjs/common';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { UserPasswordResetRequestedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<any> {
    const { email } = command;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const session = await this.userModel.db.startSession();
    await session.withTransaction(async () => {
      user.passwordResetToken = resetOTP;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save({ session });

      const event = new UserPasswordResetRequestedEvent({
        userId: user._id as string,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        resetToken: resetOTP,
      });
      // await this.eventPublisher.publish(event, session); // Logic commented out in original file
    });

    return { message: 'Password reset OTP has been sent to your email' };
  }
}
