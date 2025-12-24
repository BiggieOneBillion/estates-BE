import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { MailService } from 'src/common/services/mail.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private readonly userModel;
    private mailService;
    constructor(usersService: UsersService, jwtService: JwtService, userModel: Model<User>, mailService: MailService);
    validateUser(email: string, password: string, isMobile: boolean): Promise<any>;
    login(loginDto: LoginDto, isMobile: boolean): Promise<any>;
    validateUserEmailLogin(info: {
        email: string;
        code: string;
    }): Promise<{
        user: User;
        access_token: string;
    }>;
    validateUserRegistering(registerDto: RegisterDto): Promise<any>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
    }>;
    verifyEmail(info: {
        email: string;
        code: string;
    }): Promise<{
        message: string;
        status: number;
    }>;
    sendPasswordResetOTP(email: string): Promise<{
        message: string;
    }>;
    verifyPasswordResetOTP(email: string, otp: string): Promise<{
        token: string;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
}
