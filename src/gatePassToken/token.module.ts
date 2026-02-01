// src/token/token.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { Token, TokenSchema } from './entities/token.entity';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/common/services/mail.service';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsModule } from 'src/events/events.module';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    CloudinaryModule,
    NotificationsModule,
    EventsModule,
    ComplianceModule,
  ],
  controllers: [TokenController],
  providers: [TokenService, UsersService, MailService],
  exports: [TokenService],
})
export class TokenModule {}
