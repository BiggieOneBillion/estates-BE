import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyPreAuthCommand } from '../impl/verify-preauth.command';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtPayload } from '../../../interfaces/jwt-payload.interface';
import { UserSecurityAlertEvent } from 'src/common/events/domain/user-events';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/response/user.response.dto';

@CommandHandler(VerifyPreAuthCommand)
export class VerifyPreAuthHandler implements ICommandHandler<VerifyPreAuthCommand> {
  private readonly logger = new Logger(VerifyPreAuthHandler.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: VerifyPreAuthCommand): Promise<any> {
    const { dto, user: currentUser } = command;
    const { email, code } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if ((user._id as any).toString() !== currentUser.userId) {
      throw new UnauthorizedException('Identity mismatch');
    }

    if (code !== user.verificationToken) {
      throw new BadRequestException('Invalid verification code');
    }

    if (currentUser.reason === 'unverified_email') {
      user.isEmailVerified = true;
    } else if (currentUser.reason === 'active_on_another_device') {
      user.tokenVersion += 1;
      
      const event = new UserSecurityAlertEvent({
        userId: user._id as string,
        email: user.email,
        firstName: user.firstName,
        alertType: 'device_switch',
        details: 'you have successfully switched your active session to a new device. Previous sessions have been logged out for your security.',
      });
      await this.eventPublisher.publish(event);
    }

    user.isActive = true;
    user.lastLogin = new Date();
    user.verificationToken = null;
    await user.save();

    const newPayload: JwtPayload = {
      sub: user._id as string,
      email: user.email,
      roles: user.primaryRole as UserRole,
      type: 'auth',
      isVerified: true,
      version: user.tokenVersion,
      estate: user?.estateId?.toString(),
    };

    const userInstance = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      user: userInstance,
      access_token: this.jwtService.sign(newPayload),
    };
  }
}
