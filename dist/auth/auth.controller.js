"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const verified_guard_1 = require("./guards/verified.guard");
const swagger_1 = require("@nestjs/swagger");
const login_request_dto_1 = require("./dto/request/login.request.dto");
const register_request_dto_1 = require("./dto/request/register.request.dto");
const verify_login_request_dto_1 = require("./dto/request/verify-login.request.dto");
const verify_email_request_dto_1 = require("./dto/request/verify-email.request.dto");
const forgot_password_request_dto_1 = require("./dto/request/forgot-password.request.dto");
const verify_reset_otp_request_dto_1 = require("./dto/request/verify-reset-otp.request.dto");
const reset_password_request_dto_1 = require("./dto/request/reset-password.request.dto");
const verify_login_response_dto_1 = require("./dto/response/verify-login.response.dto");
const verify_preauth_request_dto_1 = require("./dto/request/verify-preauth.request.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto, req) {
        const userAgent = req.headers['user-agent'];
        const isMobile = /mobile/i.test(userAgent);
        return this.authService.login(loginDto, isMobile);
    }
    async VerifyLoginEmail(verifyLoginDto) {
        return this.authService.validateUserEmailLogin(verifyLoginDto);
    }
    async Register(registerDto) {
        console.log(registerDto);
        return this.authService.register(registerDto);
    }
    async verifyPreAuth(verifyPreAuthDto, req) {
        return this.authService.verifyPreAuth(verifyPreAuthDto, req.user);
    }
    async VerifyRegistrationEmail(verifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto.data);
    }
    getProfile(req) {
        return req.user;
    }
    async requestPasswordReset(forgotPasswordDto) {
        return this.authService.sendPasswordResetOTP(forgotPasswordDto.email);
    }
    async verifyPasswordResetOTP(verifyResetOtpDto, res) {
        const { token } = await this.authService.verifyPasswordResetOTP(verifyResetOtpDto.email, verifyResetOtpDto.code);
        res.cookie('reset_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 5 * 60 * 1000,
            sameSite: 'strict',
        });
        return {
            message: 'OTP verified successfully. You can now reset your password.',
        };
    }
    async resetPassword(resetPasswordDto, req, res) {
        const resetToken = req.cookies?.reset_token;
        if (!resetToken) {
            throw new common_1.UnauthorizedException('Reset token is missing or expired');
        }
        await this.authService.resetPassword(resetToken, resetPasswordDto.newPassword);
        res.clearCookie('reset_token');
        return { message: 'Password has been reset successfully' };
    }
    async logout(req) {
        return this.authService.logout(req.user.userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'User login',
        description: 'Authenticates a user and returns a JWT token.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_request_dto_1.LoginRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Login email verification',
        description: 'Verifies the OTP sent to the user email during login.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login email verification successful and returns user tokens.',
        type: verify_login_response_dto_1.VerifyLoginResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired OTP' }),
    (0, common_1.Post)('login/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_login_request_dto_1.VerifyLoginRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "VerifyLoginEmail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'User registration',
        description: 'Registers a new user and sends a verification email.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registration successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request or user already exists' }),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_request_dto_1.RegisterRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "Register", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Verify pre-auth session (email verification or multi-device)',
        description: 'Resolves pre-auth status using a 6-digit code. Handles email verification and device switching.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pre-auth resolved successfully, returns full auth token.',
        type: verify_login_response_dto_1.VerifyLoginResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('verify-preauth'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_preauth_request_dto_1.VerifyPreAuthRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPreAuth", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Verify registration email',
        description: 'Verifies the email address using the code sent during registration.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verification successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired verification code' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_request_dto_1.VerifyEmailRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "VerifyRegistrationEmail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user profile',
        description: 'Retrieves the profile information of the currently authenticated user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, verified_guard_1.VerifiedGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Request password reset',
        description: 'Sends a password reset code to the provided email address.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset OTP sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_request_dto_1.ForgotPasswordRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Verify password reset OTP',
        description: 'Verifies the OTP for password reset and sets a temporary reset token cookie.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired OTP' }),
    (0, common_1.Post)('verify-reset-otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_reset_otp_request_dto_1.VerifyResetOtpRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPasswordResetOTP", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password',
        description: 'Updates the user password using the verification token from the cookie.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Reset token is missing or expired' }),
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_request_dto_1.ResetPasswordRequestDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'User logout',
        description: 'Invalidates the current session and logs the user out.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map