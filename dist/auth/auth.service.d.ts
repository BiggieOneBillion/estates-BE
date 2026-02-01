import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { UserResponseDto } from 'src/users/dto/response/user.response.dto';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private readonly userModel;
    private eventPublisher;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, userModel: Model<User>, eventPublisher: EventPublisher);
    validateUser(email: string, password: string, isMobile: boolean): Promise<any>;
    login(loginDto: LoginRequestDto, isMobile: boolean): Promise<any>;
    validateUserEmailLogin(info: {
        email: string;
        code: string;
    }): Promise<{
        user: UserResponseDto;
        access_token: string;
    }>;
    validateUserRegistering(registerDto: RegisterRequestDto): Promise<any>;
    register(registerDto: RegisterRequestDto): Promise<{
        access_token: string;
    }>;
    verifyEmail(info: {
        email: string;
        code: string;
    }): Promise<{
        message: string;
        status: number;
    }>;
    verifyPreAuth(info: {
        email: string;
        code: string;
    }, payload: any): Promise<{
        user: UserResponseDto;
        access_token: string;
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
    logout(userId: string): Promise<{
        message: string;
    }>;
}
