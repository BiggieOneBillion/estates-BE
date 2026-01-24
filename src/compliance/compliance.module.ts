import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { LeviesModule } from '../levies/levies.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [LeviesModule, PaymentsModule, UsersModule],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
