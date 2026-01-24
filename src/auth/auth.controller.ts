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
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { request } from 'http';

/**
 * Authentication Controller
 *
 * Handles all authentication-related endpoints including user registration,
 * login, email verification, and profile retrieval.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT token.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const userAgent = req.headers['user-agent'];
    const isMobile = /mobile/i.test(userAgent);
    return this.authService.login(loginDto, isMobile);
  }

  @ApiOperation({
    summary: 'Login email verification',
    description: 'Verifies the OTP sent to the user email during login.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login email verification successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @Post('login/verify')
  async VerifyLoginEmail(@Body() body: { email: string; code: string }) {
    return this.authService.validateUserEmailLogin({
      email: body.email,
      code: body.code,
    });
  }

  @ApiOperation({
    summary: 'User registration',
    description: 'Registers a new user and sends a verification email.',
  })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request or user already exists' })
  @Post('register')
  async Register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
    @Body() body: { data: { email: string; code: string } },
  ) {
    return this.authService.verifyEmail(body.data);
  }

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile information of the currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset code to the provided email address.',
  })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('forgot-password')
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.sendPasswordResetOTP(body.email);
  }

  @ApiOperation({
    summary: 'Verify password reset OTP',
    description: 'Verifies the OTP for password reset and sets a temporary reset token cookie.',
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @Post('verify-reset-otp')
  async verifyPasswordResetOTP(
    @Body() body: { email: string; code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.authService.verifyPasswordResetOTP(
      body.email,
      body.code,
    );

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
    @Body() body: { newPassword: string },
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resetToken = req.cookies?.reset_token;

    if (!resetToken) {
      throw new UnauthorizedException('Reset token is missing or expired');
    }

    await this.authService.resetPassword(resetToken, body.newPassword);
    res.clearCookie('reset_token');

    return { message: 'Password has been reset successfully' };
  }
}

