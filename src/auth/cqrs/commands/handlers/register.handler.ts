import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../impl/register.command';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../../../interfaces/jwt-payload.interface';
import { UserCreatedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: RegisterCommand): Promise<any> {
    const { registerDto } = command;
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = new this.userModel({
      ...registerDto,
      primaryRole: UserRole.SUPER_ADMIN,
      password: hashedPassword,
      verificationToken,
    });

    const session = await this.userModel.db.startSession();
    let savedUser;
    await session.withTransaction(async () => {
      savedUser = await newUser.save({ session });
      this.logger.log(`New user registered: ${savedUser.email}`);
      this.logger.log(`New user registered email token: ${verificationToken}`);

      const event = new UserCreatedEvent({
        userId: savedUser._id as string,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.primaryRole,
        verificationToken,
      });
      await this.eventPublisher.publish(event, session);
    });

    return {
      access_token: this.jwtService.sign({
        sub: savedUser._id.toString(),
        email: savedUser.email,
        roles: savedUser.primaryRole,
        type: 'auth',
        isVerified: false,
        version: 0,
      } as JwtPayload),
    };
  }
}
