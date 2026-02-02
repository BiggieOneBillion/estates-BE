// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Res,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from './cqrs/commands/impl/login.command';
import { RegisterCommand } from './cqrs/commands/impl/register.command';
import { VerifyPreAuthCommand } from './cqrs/commands/impl/verify-preauth.command';
import { VerifyEmailCommand } from './cqrs/commands/impl/verify-email.command';
import { ForgotPasswordCommand } from './cqrs/commands/impl/forgot-password.command';
import { VerifyResetOtpCommand } from './cqrs/commands/impl/verify-reset-otp.command';
import { ResetPasswordCommand } from './cqrs/commands/impl/reset-password.command';
import { LogoutCommand } from './cqrs/commands/impl/logout.command';
import { VerifyLoginCommand } from './cqrs/commands/impl/verify-login.command';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifiedGuard } from './guards/verified.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { VerifyLoginRequestDto } from './dto/request/verify-login.request.dto';
import { VerifyEmailRequestDto } from './dto/request/verify-email.request.dto';
import { ForgotPasswordRequestDto } from './dto/request/forgot-password.request.dto';
import { VerifyResetOtpRequestDto } from './dto/request/verify-reset-otp.request.dto';
import { ResetPasswordRequestDto } from './dto/request/reset-password.request.dto';
import { VerifyLoginResponseDto } from './dto/response/verify-login.response.dto';
import { VerifyPreAuthRequestDto } from './dto/request/verify-preauth.request.dto';
import { Response } from 'express';
// import { request } from 'http';

/**
 * Authentication Controller
 *
 * Handles all authentication-related endpoints including user registration,
 * login, email verification, and profile retrieval.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT token.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() loginDto: LoginRequestDto, @Request() req) {
    const userAgent = req.headers['user-agent'];
    const isMobile = /mobile/i.test(userAgent);
    return this.commandBus.execute(new LoginCommand(loginDto, isMobile));
  }

  @ApiOperation({
    summary: 'Login email verification',
    description: 'Verifies the OTP sent to the user email during login.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login email verification successful and returns user tokens.',
    type: VerifyLoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @Post('login/verify')
  async VerifyLoginEmail(@Body() verifyLoginDto: VerifyLoginRequestDto) {
    return this.commandBus.execute(new VerifyLoginCommand(verifyLoginDto));
  }

  @ApiOperation({
    summary: 'User registration',
    description: 'Registers a new user and sends a verification email.',
  })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request or user already exists' })
  @Post('register')
  async Register(@Body() registerDto: RegisterRequestDto) {
    return this.commandBus.execute(new RegisterCommand(registerDto));
  }

  @ApiOperation({
    summary: 'Verify pre-auth session (email verification or multi-device)',
    description: 'Resolves pre-auth status using a 6-digit code. Handles email verification and device switching.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pre-auth resolved successfully, returns full auth token.',
    type: VerifyLoginResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify-preauth')
  async verifyPreAuth(@Body() verifyPreAuthDto: VerifyPreAuthRequestDto, @Request() req) {
    return this.commandBus.execute(new VerifyPreAuthCommand(verifyPreAuthDto, req.user));
  }

  @ApiOperation({
    summary: 'Verify registration email',
    description: 'Verifies the email address using the code sent during registration.',
  })
  @ApiResponse({ status: 200, description: 'Email verification successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired verification code' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  async VerifyRegistrationEmail(
    @Body() verifyEmailDto: VerifyEmailRequestDto,
  ) {
    return this.commandBus.execute(new VerifyEmailCommand(verifyEmailDto.data.email, verifyEmailDto.data.code));
  }

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile information of the currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset code to the provided email address.',
  })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('forgot-password')
  async requestPasswordReset(@Body() forgotPasswordDto: ForgotPasswordRequestDto) {
    return this.commandBus.execute(new ForgotPasswordCommand(forgotPasswordDto.email));
  }

  @ApiOperation({
    summary: 'Verify password reset OTP',
    description: 'Verifies the OTP for password reset and sets a temporary reset token cookie.',
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @Post('verify-reset-otp')
  async verifyPasswordResetOTP(
    @Body() verifyResetOtpDto: VerifyResetOtpRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.commandBus.execute(new VerifyResetOtpCommand(
      verifyResetOtpDto.email,
      verifyResetOtpDto.code,
    ));

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

  @ApiOperation({
    summary: 'Reset password',
    description: 'Updates the user password using the verification token from the cookie.',
  })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Reset token is missing or expired' })
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resetToken = req.cookies?.reset_token;

    if (!resetToken) {
      throw new UnauthorizedException('Reset token is missing or expired');
    }

    await this.commandBus.execute(new ResetPasswordCommand(resetToken, resetPasswordDto.newPassword));
    res.clearCookie('reset_token');

    return { message: 'Password has been reset successfully'};
  }

  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidates the current session and logs the user out.',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.commandBus.execute(new LogoutCommand(req.user.userId));
  }
}

