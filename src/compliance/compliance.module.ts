import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { LeviesModule } from '../levies/levies.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';

import { CheckUserComplianceHandler } from './cqrs/queries/handlers/check-user-compliance.handler';
import { GetEstateComplianceReportHandler } from './cqrs/queries/handlers/get-estate-compliance-report.handler';
import { GetOutstandingLeviesHandler } from './cqrs/queries/handlers/get-outstanding-levies.handler';

export const QueryHandlers = [
  CheckUserComplianceHandler,
  GetEstateComplianceReportHandler,
  GetOutstandingLeviesHandler,
];

@Module({
  imports: [
    CqrsModule,
    LeviesModule, 
    PaymentsModule, 
    UsersModule,
  ],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    ...QueryHandlers,
  ],
  exports: [ComplianceService],
})
export class ComplianceModule {}
