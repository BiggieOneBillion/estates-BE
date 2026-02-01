import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { VerifyLoginResponseDto } from './dto/response/verify-login.response.dto';
import { UserResponseDto } from 'src/users/dto/response/user.response.dto';
import { plainToInstance } from "class-transformer"
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import {
  UserCreatedEvent,
  UserLoggedInEvent,
  UserPasswordResetRequestedEvent,
  UserVerifiedEvent,
  UserVerificationEmailRequestedEvent,
  UserSecurityAlertEvent,
} from 'src/common/events/domain/user-events';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private eventPublisher: EventPublisher,
  ) {}

  async validateUser(
    email: string,
    password: string,
    isMobile: boolean,
  ): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new BadRequestException('Invalid credentials');
    }

    if (!isMobile && user.primaryRole !== UserRole.SUPER_ADMIN) { // checks if the device is mobile if not so, then only super admin can log in.
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
        // estate: user.estate,
      };

      // Use transaction to publish event atomically
      const session = await this.userModel.db.startSession();
      await session.withTransaction(async () => {
        // Publish UserVerificationEmailRequestedEvent
        const event = new UserVerificationEmailRequestedEvent({
          userId: user._id as string,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          verificationToken: user.verificationToken!,
        });
        await this.eventPublisher.publish(event, session);
      });
      // Return custom response instead of throwing exception
      return {
        status: 222,
        message: 'Email not verified',
        verified: false,
        email: user.email,
        access_token: this.jwtService.sign(payload),
      };
    }

    // Generate a 6-digit verification code
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    if(user.isActive){ // IF USER IS ACTIVE ( THAT IS LOGGED IN ON ANOTHER DEVICE) AND WANT TO LOG IN ON THIS DEVICE
        const payload: JwtPayload = {
        sub: user._id as string,
        email: user.email,
        roles: user.primaryRole as UserRole,
        type: 'pre-auth',
        isVerified: false,
        reason: 'active_on_another_device',
        version: user.tokenVersion,
        // estate: user.estate,
      };

      // Use transaction to save user and publish event atomically
      const session = await this.userModel.db.startSession();
      await session.withTransaction(async () => {
        user.verificationToken = verificationToken;
        await user.save({ session });

        // Publish UserLoggedInEvent
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

      // Return custom response instead of throwing exception
      return {
        status: 222,
        message: 'User logged in on another device',
        active: true,
        email: user.email,
        access_token: this.jwtService.sign(payload),
      };
    }

    

 
    // Use transaction to save user and publish event atomically
    const session = await this.userModel.db.startSession();
    await session.withTransaction(async () => {
      user.verificationToken = verificationToken;
      await user.save({ session });

      // Publish UserLoggedInEvent
      const event = new UserLoggedInEvent({
        userId: user._id as string,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationToken,
      });
      await this.eventPublisher.publish(event, session);
    });

    console.log('Login Verification token---', verificationToken);

    // Remove password from returned user
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  }

  async login(loginDto: LoginRequestDto, isMobile: boolean) {
    const result = await this.validateUser(
      loginDto.email,
      loginDto.password,
      isMobile,
    );

    // Check if the result is the custom unverified email response
    if (result.status === 222) {
      return result; // Return the custom response directly
    }

    return {
      message: 'Credential Valid',
      status: 200,
    };
  }

  async validateUserEmailLogin(info: { email: string; code: string }) {
    const { email, code } = info;
    const user = await this.usersService.findByEmail(email);

    // console.log('User:', user); // Add this line to log the user

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isVerificationCodeValid = code === user.verificationToken;

    console.log('Verification code valid:', isVerificationCodeValid); // Add this line to log the verification code validity

    if (!isVerificationCodeValid) {
      throw new BadRequestException('Invalid credentials');
    }


    // Update user isActive to true
    user.isActive = true;

    // Update last login timestamp and verificationToken
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

    // console.log('User instance:', userInstance);

    return {
      user: userInstance,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUserRegistering(registerDto: RegisterRequestDto): Promise<any> {
    // console.log('Inside service');
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    // console.log('Inside service 1', existingUser);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate a 6-digit verification code
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // console.log('Inside service 2', verificationToken);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // console.log('Inside service 4', hashedPassword);

    // console.log('Hashed password:', hashedPassword);
    const newUser = new this.userModel({
      ...registerDto,
      primaryRole: UserRole.SUPER_ADMIN,
      password: hashedPassword,
      verificationToken,
    });

    // console.log('New user:', newUser); // Add this line to log the newUser object

    // Use transaction to save user and publish event atomically
    const session = await this.userModel.db.startSession();
    let savedUser;
    await session.withTransaction(async () => {
      savedUser = await newUser.save({ session });
      this.logger.log(`New user registered: ${savedUser.email}`);
      this.logger.log(`New user registered email token: ${verificationToken}`);

      // Publish UserCreatedEvent
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

    const resObj = {
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
      roles: savedUser.primaryRole,
      isActive: savedUser.isActive,
      isEmailVerified: savedUser.isEmailVerified,
      isTemporaryPassword: savedUser.isTemporaryPassword,
      id: savedUser._id,
      permissions: savedUser.basePermissions,
    };
    return resObj;
  }

  async register(registerDto: RegisterRequestDto) {
    const user = await this.validateUserRegistering(registerDto);
    console.log('USER', user);
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      roles: user.primaryRole,
      type: 'auth',
      isVerified: false, // Registration still needs email verification
      version: 0, // Initial version
      // estate: user?.estateId?.toString(),
    };

    // console.log('PAYLOAD', payload);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyEmail(info: { email: string; code: string }) {
    const { email, code } = info;
    const emailExistAndIsNotVerified = await this.userModel
      .findOne({
        email: email,
      })
      .exec();

    if (!emailExistAndIsNotVerified) {
      throw new BadRequestException('Email does not exist');
    }

    if (emailExistAndIsNotVerified?.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const codeCheck = code === emailExistAndIsNotVerified?.verificationToken;

    if (!codeCheck) {
      throw new BadRequestException('Incorrect Token');
    }

    // Update the user's verification status
    emailExistAndIsNotVerified.isEmailVerified = true;
    emailExistAndIsNotVerified.verificationToken = null; // Optional: clear the token after use
    await emailExistAndIsNotVerified.save();

    return {
      message: 'Email Verification Successful',
      status: 200,
    };
  }

  async verifyPreAuth(info: { email: string; code: string }, payload: any) {
    const { email, code } = info;
    const user = await this.usersService.findByEmail(email);

    console.log('USER', user!._id);

    console.log('PAYLOAD', payload);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if ((user._id as any).toString() !== payload.userId) {
      throw new UnauthorizedException('Identity mismatch');
    }

    if (code !== user.verificationToken) {
      throw new BadRequestException('Invalid verification code');
    }

    if (payload.reason === 'unverified_email') {
      user.isEmailVerified = true;
    } else if (payload.reason === 'active_on_another_device') {
      // Increment version to invalidate all current tokens
      user.tokenVersion += 1;
      
      // Publish Security Alert event
      const event = new UserSecurityAlertEvent({
        userId: user._id as string,
        email: user.email,
        firstName: user.firstName,
        alertType: 'device_switch',
        details: 'you have successfully switched your active session to a new device. Previous sessions have been logged out for your security.',
      });
      // Case where we are already in a potential session or need a new one
      // verifyPreAuth doesn't currently use a transaction for user.save(), 
      // but eventPublisher.publish should ideally have one.
      // For now, publishing without explicit session as per existing verifyPreAuth pattern
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

  // Add these methods to the AuthService class

  async sendPasswordResetOTP(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    // Generate a 6-digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Use transaction to save user and publish event atomically
    const session = await this.userModel.db.startSession();
    await session.withTransaction(async () => {
      // Store the OTP and set an expiration time (15 minutes from now)
      user.passwordResetToken = resetOTP;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save({ session });

      // Publish UserPasswordResetRequestedEvent
      const event = new UserPasswordResetRequestedEvent({
        userId: user._id as string,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        resetToken: resetOTP,
      });
      // await this.eventPublisher.publish(event, session);
    });

    return { message: 'Password reset OTP has been sent to your email' };
  }

  async verifyPasswordResetOTP(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    // Check if OTP is valid and not expired
    if (
      user.passwordResetToken !== otp ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Generate a short-lived JWT token (5 minutes)
    const payload = {
      sub: user._id as string,
      email: user.email,
      type: 'password_reset',
    };

    const token = this.jwtService.sign(payload, { expiresIn: '5m' });

    return { token };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      // Verify the token
      const payload = this.jwtService.verify(resetToken);

      // Check if it's a password reset token
      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userModel.findById(payload.sub);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password and clear reset tokens
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.isTemporaryPassword = false;

      await user.save();

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw error;
    }
  }

  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isActive = false;
    user.tokenVersion += 1; // Invalidate all current tokens
    await user.save();

    this.logger.log(`User logged out: ${user.email}`);

    return { message: 'Logout successful' };
  }
}
