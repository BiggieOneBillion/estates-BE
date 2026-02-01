import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyLoginCommand } from '../impl/verify-login.command';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { JwtPayload } from '../../../interfaces/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/response/user.response.dto';

@CommandHandler(VerifyLoginCommand)
export class VerifyLoginHandler implements ICommandHandler<VerifyLoginCommand> {
  private readonly logger = new Logger(VerifyLoginHandler.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: VerifyLoginCommand): Promise<any> {
    const { dto } = command;
    const { email, code } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isVerificationCodeValid = code === user.verificationToken;

    if (!isVerificationCodeValid) {
      throw new BadRequestException('Invalid credentials');
    }

    user.isActive = true;
    user.lastLogin = new Date();
    user.verificationToken = null;

    await user.save();

    const payload: JwtPayload = {
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
      access_token: this.jwtService.sign(payload),
    };
  }
}
