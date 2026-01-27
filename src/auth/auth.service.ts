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
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { MailService } from 'src/common/services/mail.service';
import { UserResponseDto, VerifyLoginResponseDto } from './dto/verify-login-response.dto';
import { plainToInstance } from "class-transformer"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private mailService: MailService,
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
        // estate: user.estate,
      };

      // here we resend the email to the user and tell them to verify their email
      await this.mailService.sendVerificationEmail(
        user.email,
        user.verificationToken!,
        `${user.firstName} ${user.lastName}`,
      );
      // Return custom response instead of throwing exception
      return {
        status: 222,
        message: 'Email not verified',
        verified: false,
        email: user.email,
        access_token: this.jwtService.sign(payload),
      };
    }

    if(user.isActive){ // IF USER IS ACTIVE ( THAT IS LOGGED IN ON ANOTHER DEVICE) AND WANT TO LOG IN ON THIS DEVICE
        const payload: JwtPayload = {
        sub: user._id as string,
        email: user.email,
        roles: user.primaryRole as UserRole,
        type: 'pre-auth',
        isVerified: false,
        // estate: user.estate,
      };

      // here we resend the email to the user and tell them to verify their email
      await this.mailService.sendVerificationEmail(
        user.email,
        user.verificationToken!,
        `${user.firstName} ${user.lastName}`,
      );
      // Return custom response instead of throwing exception
      return {
        status: 222,
        message: 'User logged in on another device',
        active: true,
        email: user.email,
        access_token: this.jwtService.sign(payload),
      };
    }

    

    // Generate a 6-digit verification code
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.verificationToken = verificationToken;
    await user.save();

    console.log('Login Verification token---', verificationToken);

    // Send verification email
    // await this.mailService.sendVerificationEmail(
    //   email,
    //   verificationToken,
    //   `${user.firstName} ${user.lastName}`,
    // );

    // Remove password from returned user
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  }

  async login(loginDto: LoginDto, isMobile: boolean) {
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
      // estate: user.estate,
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

  async validateUserRegistering(registerDto: RegisterDto): Promise<any> {
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

    const savedUser = await newUser.save();
    this.logger.log(`New user registered: ${savedUser.email}`);
    // await this.mailService.sendVerificationEmail(
    //   registerDto.email,
    //   verificationToken,
    //   `${registerDto.firstName} ${registerDto.lastName}`,
    // );
    // console.log('E no easye');
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

  async register(registerDto: RegisterDto) {
    const user = await this.validateUserRegistering(registerDto);
    console.log('USER', user);
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      roles: user.roles,
      type: 'auth',
      isVerified: false, // Registration still needs email verification
      estate: user.estate,
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

  // Add these methods to the AuthService class

  async sendPasswordResetOTP(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    // Generate a 6-digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the OTP and set an expiration time (15 minutes from now)
    user.passwordResetToken = resetOTP;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send the OTP via email
    await this.mailService.sendPasswordResetEmail(
      email,
      resetOTP,
      `${user.firstName} ${user.lastName}`,
    );

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
}
