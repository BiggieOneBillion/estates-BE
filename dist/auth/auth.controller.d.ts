import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyLoginDto } from './dto/verify-login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPreAuthDto } from './dto/verify-preauth.dto';
import { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: any): Promise<any>;
    VerifyLoginEmail(verifyLoginDto: VerifyLoginDto): Promise<{
        user: import("./dto/verify-login-response.dto").UserResponseDto;
        access_token: string;
    }>;
    Register(registerDto: RegisterDto): Promise<{
        access_token: string;
    }>;
    verifyPreAuth(verifyPreAuthDto: VerifyPreAuthDto, req: any): Promise<{
        user: import("./dto/verify-login-response.dto").UserResponseDto;
        access_token: string;
    }>;
    VerifyRegistrationEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
        status: number;
    }>;
    getProfile(req: any): any;
    requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyPasswordResetOTP(verifyResetOtpDto: VerifyResetOtpDto, res: Response): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto, req: any, res: Response): Promise<{
        message: string;
    }>;
}
