import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeviesService } from './levies.service';
import { LeviesController } from './levies.controller';
import { Levy, LevySchema } from './entities/levy.entity';
import { UsersModule } from '../users/users.module';
import { PaymentReminderService } from './payment-reminder.service';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Levy.name, schema: LevySchema }]),
    UsersModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [LeviesController],
  providers: [LeviesService, PaymentReminderService],
  exports: [LeviesService],
})
export class LeviesModule {}
