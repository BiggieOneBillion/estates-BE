import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './entities/payment.entity';
import { LeviesModule } from '../levies/levies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    LeviesModule,
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
