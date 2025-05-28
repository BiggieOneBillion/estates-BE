import { Module, OnModuleInit } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      // validationSchema: validationSchema,
    }),
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
}
