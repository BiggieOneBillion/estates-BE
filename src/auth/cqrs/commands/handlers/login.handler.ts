import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../impl/login.command';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { BadRequestException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../../../interfaces/jwt-payload.interface';
import { UserLoggedInEvent, UserVerificationEmailRequestedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: LoginCommand): Promise<any> {
    const { loginDto, isMobile } = command;
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new BadRequestException('Invalid credentials');
    }

    if (!isMobile && user.primaryRole !== UserRole.SUPER_ADMIN) {
      return {
        message: 'Login through your mobile device',
        status: 400,
      };
    }

    if (!user.isEmailVerified && user.primaryRole === UserRole.SUPER_ADMIN) {
      const payload: JwtPayload = {
        sub: user._id as string,
        email: user.email,
        roles: user.primaryRole as UserRole,
        type: 'pre-auth',
        isVerified: false,
        reason: 'unverified_email',
        version: user.tokenVersion,
      };

      const session = await this.userModel.db.startSession();
      await session.withTransaction(async () => {
        const event = new UserVerificationEmailRequestedEvent({
          userId: user._id as string,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          verificationToken: user.verificationToken!,
        });
        await this.eventPublisher.publish(event, session);
      });
      return {
        status: 222,
        message: 'Email not verified',
        verified: false,
        email: user.email,
        access_token: this.jwtService.sign(payload),
      };
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    if (user.isActive) {
      const payload: JwtPayload = {
        sub: user._id as string,
        email: user.email,
        roles: user.primaryRole as UserRole,
        type: 'pre-auth',
        isVerified: false,
        reason: 'active_on_another_device',
        version: user.tokenVersion,
      };

      const session = await this.userModel.db.startSession();
      await session.withTransaction(async () => {
        user.verificationToken = verificationToken;
        await user.save({ session });

        const event = new UserLoggedInEvent({
          userId: user._id as string,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          verificationToken,
          deviceInfo: 'active_on_another_device',
        });
        await this.eventPublisher.publish(event, session);
      });

      return {
        status: 222,
        message: 'User logged in on another device',
        active: true,
        email: user.email,
        access_token: this.jwtService.sign(payload),
      };
    }

    const session = await this.userModel.db.startSession();
    await session.withTransaction(async () => {
      user.verificationToken = verificationToken;
      await user.save({ session });

      const event = new UserLoggedInEvent({
        userId: user._id as string,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationToken,
      });
      await this.eventPublisher.publish(event, session);
    });

    this.logger.log(`Login Verification token--- ${verificationToken}`);

    // Check if the result is the custom unverified email response
    // The logic in AuthService.login() checked for status 222, but here we return the userObject directly for normal login
    // or the custom response above.
    
    // Original AuthService.login wrapper logic:
    // if (result.status === 222) return result; 
    // return { message: 'Credential Valid', status: 200 };

    // Since we return objects directly, we can keep the structure.
    // However, the original validateUser returned userObject (without password).
    // The AuthService.login method then wrapped it.
    // Here we can simplify.

    return {
      message: 'Credential Valid',
      status: 200,
    };
  }
}
