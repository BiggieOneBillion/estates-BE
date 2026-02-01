// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { MailService } from 'src/common/services/mail.service'; 
import { EventsInfrastructureModule } from 'src/common/events/events-infrastructure.module';

import { CqrsModule } from '@nestjs/cqrs';
import { LoginHandler } from './cqrs/commands/handlers/login.handler';
import { RegisterHandler } from './cqrs/commands/handlers/register.handler';
import { VerifyPreAuthHandler } from './cqrs/commands/handlers/verify-preauth.handler';
import { VerifyEmailHandler } from './cqrs/commands/handlers/verify-email.handler';
import { ForgotPasswordHandler } from './cqrs/commands/handlers/forgot-password.handler';
import { VerifyResetOtpHandler } from './cqrs/commands/handlers/verify-reset-otp.handler';
import { ResetPasswordHandler } from './cqrs/commands/handlers/reset-password.handler';
import { LogoutHandler } from './cqrs/commands/handlers/logout.handler';
import { VerifyLoginHandler } from './cqrs/commands/handlers/verify-login.handler';

export const CommandHandlers = [
  LoginHandler,
  RegisterHandler,
  VerifyPreAuthHandler,
  VerifyEmailHandler,
  ForgotPasswordHandler,
  VerifyResetOtpHandler,
  ResetPasswordHandler,
  LogoutHandler,
  VerifyLoginHandler,
];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '365d' },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EventsInfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, MailService, ...CommandHandlers],
  exports: [JwtModule],
})
export class AuthModule {}
