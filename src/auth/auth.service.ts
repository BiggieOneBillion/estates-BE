// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
// import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { MailService } from 'src/common/services/mail.service';
import { Console } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      const payload: JwtPayload = {
        sub: user._id as string,
        email: user.email,
        roles: user.roles,
        // estate: user.estate,
      };
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
    user.verificationToken = verificationToken;
    await user.save();

    // // Send verification email
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

  async login(loginDto: LoginDto) {
    const result = await this.validateUser(loginDto.email, loginDto.password);

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

    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isVerificationCodeValid = code === user.verificationToken;

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
      roles: user.roles,
      // estate: user.estate,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUserRegistering(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate a 6-digit verification code
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = new this.userModel({
      ...registerDto,
      roles: [UserRole.SUPER_ADMIN],
      password: hashedPassword,
      verificationToken,
      isEmailVerified: false,
    });

    const savedUser = await newUser.save();
    // console.log('Happy time');
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
      roles: savedUser.roles,
      isActive: savedUser.isActive,
      isEmailVerified: savedUser.isEmailVerified,
      isTemporaryPassword: savedUser.isTemporaryPassword,
      id: savedUser._id,
      permissions: savedUser.permissions,
    };
    return resObj;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.validateUserRegistering(registerDto);
    const payload: JwtPayload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
      estate: user.estate,
    };

    return {
      user,
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
}
