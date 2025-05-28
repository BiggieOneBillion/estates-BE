import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<any>;
    VerifyLoginEmail(body: {
        email: string;
        code: string;
    }): Promise<{
        user: import("../users/entities/user.entity").User;
        access_token: string;
    }>;
    Register(registerDto: RegisterDto): Promise<{
        user: any;
        access_token: string;
    }>;
    VerifyRegistrationEmail(body: {
        email: string;
        code: string;
    }): Promise<{
        message: string;
        status: number;
    }>;
    getProfile(req: any): any;
}
