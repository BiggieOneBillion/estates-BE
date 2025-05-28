// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'User login email verification' })
  @ApiResponse({
    status: 200,
    description: 'login email verification successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @Post('login/verify')
  async VerifyLoginEmail(@Body() body: { email: string; code: string }) {
    return this.authService.validateUserEmailLogin({
      email: body.email,
      code: body.code,
    });
  }

  @ApiOperation({ summary: 'User Registration' })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @Post('register')
  async Register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'User Email Verification' })
  @ApiResponse({ status: 200, description: 'Email Verification successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiTags('Authentication')
  @Post('verify-email')
  async VerifyRegistrationEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail({ email: body.email, code: body.code });
  }

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
}
