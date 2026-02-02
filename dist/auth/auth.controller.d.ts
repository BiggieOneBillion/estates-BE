import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
    private commandBus;
    private queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    login(loginDto: LoginRequestDto, req: any): Promise<any>;
    VerifyLoginEmail(verifyLoginDto: VerifyLoginRequestDto): Promise<any>;
    Register(registerDto: RegisterRequestDto): Promise<any>;
    verifyPreAuth(verifyPreAuthDto: VerifyPreAuthRequestDto, req: any): Promise<any>;
    VerifyRegistrationEmail(verifyEmailDto: VerifyEmailRequestDto): Promise<any>;
    getProfile(req: any): any;
    requestPasswordReset(forgotPasswordDto: ForgotPasswordRequestDto): Promise<any>;
    verifyPasswordResetOTP(verifyResetOtpDto: VerifyResetOtpRequestDto, res: Response): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordRequestDto, req: any, res: Response): Promise<{
        message: string;
    }>;
    logout(req: any): Promise<any>;
}
