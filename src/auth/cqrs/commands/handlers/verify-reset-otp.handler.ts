import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyResetOtpCommand } from '../impl/verify-reset-otp.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Logger } from '@nestjs/common';

@CommandHandler(VerifyResetOtpCommand)
export class VerifyResetOtpHandler implements ICommandHandler<VerifyResetOtpCommand> {
  private readonly logger = new Logger(VerifyResetOtpHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async execute(command: VerifyResetOtpCommand): Promise<any> {
    const { email, otp } = command;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    if (
      user.passwordResetToken !== otp ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const payload = {
      sub: user._id as string,
      email: user.email,
      type: 'password_reset',
    };

    const token = this.jwtService.sign(payload, { expiresIn: '5m' });

    return { token };
  }
}
