import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { VerifyLoginRequestDto } from './dto/request/verify-login.request.dto';
import { VerifyEmailRequestDto } from './dto/request/verify-email.request.dto';
import { ForgotPasswordRequestDto } from './dto/request/forgot-password.request.dto';
import { VerifyResetOtpRequestDto } from './dto/request/verify-reset-otp.request.dto';
import { ResetPasswordRequestDto } from './dto/request/reset-password.request.dto';
import { VerifyPreAuthRequestDto } from './dto/request/verify-preauth.request.dto';
import { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginRequestDto, req: any): Promise<any>;
    VerifyLoginEmail(verifyLoginDto: VerifyLoginRequestDto): Promise<{
        user: import("../users/dto/response/user.response.dto").UserResponseDto;
        access_token: string;
    }>;
    Register(registerDto: RegisterRequestDto): Promise<{
        access_token: string;
    }>;
    verifyPreAuth(verifyPreAuthDto: VerifyPreAuthRequestDto, req: any): Promise<{
        user: import("../users/dto/response/user.response.dto").UserResponseDto;
        access_token: string;
    }>;
    VerifyRegistrationEmail(verifyEmailDto: VerifyEmailRequestDto): Promise<{
        message: string;
        status: number;
    }>;
    getProfile(req: any): any;
    requestPasswordReset(forgotPasswordDto: ForgotPasswordRequestDto): Promise<{
        message: string;
    }>;
    verifyPasswordResetOTP(verifyResetOtpDto: VerifyResetOtpRequestDto, res: Response): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordRequestDto, req: any, res: Response): Promise<{
        message: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
}
