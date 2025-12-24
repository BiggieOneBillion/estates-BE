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
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * User Login Endpoint
   *
   * Authenticates a user with their email and password.
   * Returns a JWT token upon successful authentication.
   *
   * @param loginDto - Contains user email and password
   * @returns JWT token and user information
   */
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const userAgent = req.headers['user-agent'];
    const isMobile = /mobile/i.test(userAgent);
    // console.log(req.headers['user-agent']);
    // if (/mobile/i.test(userAgent)) {
    //   console.log('Request is from a mobile device');
    // } else {
    //   console.log('Request is from a desktop or web');
    // }
    return this.authService.login(loginDto, isMobile);
  }

  /**
   * Login Email Verification Endpoint
   *
   * Verifies the email verification code sent during login process.
   * Used for two-factor authentication or email verification during login.
   *
   * @param body - Contains user email and verification code
   * @returns Authentication result with JWT token upon successful verification
   */
  @ApiOperation({ summary: 'User login email verification' })
  @ApiResponse({
    status: 200,
    description: 'login email verification successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @Post('login/verify')
  async VerifyLoginEmail(@Body() body: { email: string; code: string }) {
    // console.log(body)
    return this.authService.validateUserEmailLogin({
      email: body.email,
      code: body.code,
    });
  }

  /**
   * User Registration Endpoint
   *
   * Creates a new user account in the system.
   * Sends a verification email to the user's email address.
   *
   * @param registerDto - Contains user registration details (name, email, password, etc.)
   * @returns Newly created user information
   */
  @ApiOperation({ summary: 'User Registration' })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @Post('register')
  async Register(@Body() registerDto: RegisterDto) {
    // console.log(registerDto);
    return this.authService.register(registerDto);
  }

  /**
   * Email Verification Endpoint
   *
   * Verifies a user's email address using the verification code sent during registration.
   * Updates the user's status to email verified upon successful verification.
   *
   * @param body - Contains user email and verification code
   * @returns Verification result
   */
  @ApiOperation({ summary: 'User Email Verification' })
  @ApiResponse({ status: 200, description: 'Email Verification successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  async VerifyRegistrationEmail(
    @Body() body: { data: { email: string; code: string } },
  ) {
    console.log(body.data);
    return this.authService.verifyEmail(body.data);
  }

  /**
   * User Profile Endpoint
   *
   * Retrieves the authenticated user's profile information.
   * Requires a valid JWT token in the Authorization header.
   *
   * @param req - Request object containing the authenticated user information
   * @returns User profile data
   */
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @ApiTags('Authentication')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  /**
   * Request Password Reset Endpoint
   *
   * Sends a password reset OTP to the user's email address.
   *
   * @param body - Contains user email
   * @returns Success message
   */
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  @ApiTags('Authentication')
  @Post('forgot-password')
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.sendPasswordResetOTP(body.email);
  }

  /**
   * Verify Password Reset OTP Endpoint
   *
   * Verifies the password reset OTP and returns a short-lived token.
   *
   * @param body - Contains user email and OTP code
   * @param res - Express response object for setting HTTP-only cookie
   * @returns Success message
   */
  @ApiOperation({ summary: 'Verify password reset OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiTags('Authentication')
  @Post('verify-reset-otp')
  async verifyPasswordResetOTP(
    @Body() body: { email: string; code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.authService.verifyPasswordResetOTP(
      body.email,
      body.code,
    );

    // Set HTTP-only cookie with 5-minute expiration
    res.cookie('reset_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 5 * 60 * 1000, // 5 minutes in milliseconds
      sameSite: 'strict',
    });

    return {
      message: 'OTP verified successfully. You can now reset your password.',
    };
  }

  /**
   * Reset Password Endpoint
   *
   * Resets the user's password using the token from the HTTP-only cookie.
   *
   * @param body - Contains new password
   * @param req - Express request object for accessing cookies
   * @param res - Express response object for clearing cookies
   * @returns Success message
   */
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiTags('Authentication')
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

    // Clear the reset token cookie
    res.clearCookie('reset_token');

    return { message: 'Password has been reset successfully' };
  }
}
