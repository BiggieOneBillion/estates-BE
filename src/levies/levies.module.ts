import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeviesService } from './levies.service';
import { LeviesController } from './levies.controller';
import { Levy, LevySchema } from './entities/levy.entity';
import { UsersModule } from '../users/users.module';
import { PaymentReminderService } from './payment-reminder.service';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailService } from '../common/services/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Levy.name, schema: LevySchema }]),
    UsersModule,
    forwardRef(() => PaymentsModule),
    NotificationsModule,
  ],
  controllers: [LeviesController],
  providers: [LeviesService, PaymentReminderService, MailService],
  exports: [LeviesService],
})
export class LeviesModule {}
