import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: any): Promise<any>;
    VerifyLoginEmail(body: {
        email: string;
        code: string;
    }): Promise<{
        user: import("../users/entities/user.entity").User;
        access_token: string;
    }>;
    Register(registerDto: RegisterDto): Promise<{
        access_token: string;
    }>;
    VerifyRegistrationEmail(body: {
        data: {
            email: string;
            code: string;
        };
    }): Promise<{
        message: string;
        status: number;
    }>;
    getProfile(req: any): any;
    requestPasswordReset(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    verifyPasswordResetOTP(body: {
        email: string;
        code: string;
    }, res: Response): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        newPassword: string;
    }, req: any, res: Response): Promise<{
        message: string;
    }>;
}
