import {
  MiddlewareConsumer,
  Module,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EstatesModule } from './estates/estates.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig } from './config/database.config';
import { PropertiesModule } from './properties/properties.module';
import { InitialSeedService } from './common/seeders/initial-seeds';
import { User, UserSchema } from './users/entities/user.entity';
import { Estate, EstateSchema } from './estates/entities/estate.entity';
import { MailService } from './common/services/mail.service';
import { validationSchema } from './config/validation.schema';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TokenModule } from './gatePassToken/token.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      // validationSchema: validationSchema,
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = new DatabaseConfig(configService);
        return dbConfig.getMongoConfig();
      },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Estate.name, schema: EstateSchema },
    ]),
    AuthModule,
    UsersModule,
    EstatesModule,
    PropertiesModule,
    TokenModule,
    CloudinaryModule,
    NotificationsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService, InitialSeedService, MailService],
  // exports: [MailService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly initialSeedService: InitialSeedService) {}
  async onModuleInit() {
    await this.initialSeedService.seed();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
