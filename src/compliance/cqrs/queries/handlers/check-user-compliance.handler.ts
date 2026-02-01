import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { CheckUserComplianceQuery } from '../impl/compliance-queries.impl';
import { GetEnforcedLeviesForUserQuery } from '../../../../levies/cqrs/queries/impl/levy-queries.impl';
import { FindUserByIdQuery } from '../../../../users/cqrs/queries/impl/find-user-by-id.query';
import { PaymentsService } from '../../../../payments/payments.service';
import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ComplianceStatusDto } from '../dto/compliance.response.dto';
import { LevyResponseDto } from '../../../../levies/dto/response/levy.response.dto';

@QueryHandler(CheckUserComplianceQuery)
export class CheckUserComplianceHandler implements IQueryHandler<CheckUserComplianceQuery> {
  private readonly logger = new Logger(CheckUserComplianceHandler.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly paymentsService: PaymentsService,
  ) {}

  async execute(query: CheckUserComplianceQuery): Promise<ComplianceStatusDto> {
    const { userId } = query;
    try {
      // 1. Get user details
      const user = await this.queryBus.execute(new FindUserByIdQuery(userId));
      
      if (!user || !user.estateId) {
        return plainToInstance(ComplianceStatusDto, {
          isCompliant: true,
          canCreateToken: true,
          outstandingLevies: [],
          totalOutstanding: 0,
        });
      }

      // 2. Get all enforced levies for this user's role and estate
      const enforcedLevies = await this.queryBus.execute(
        new GetEnforcedLeviesForUserQuery(
          userId,
          user.primaryRole,
          user.estateId.toString(),
        )
      );

      // 3. Check which levies haven't been paid
      const outstandingLevies: any[] = [];
      let totalOutstanding = 0;

      for (const levy of enforcedLevies) {
        const hasPaid = await this.paymentsService.hasUserPaidLevy(userId, (levy._id as any).toString());
        
        if (!hasPaid) {
          // Check if levy is past due date (including grace period)
          const effectiveDueDate = new Date(levy.dueDate);
          effectiveDueDate.setDate(effectiveDueDate.getDate() + (levy.gracePeriodDays || 0));
          
          if (new Date() > effectiveDueDate) {
            outstandingLevies.push(levy);
            totalOutstanding += levy.amount;
          }
        }
      }

      const isCompliant = outstandingLevies.length === 0;

      this.logger.debug(
        `Compliance check for user ${userId}: ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'} (${outstandingLevies.length} outstanding levies)`
      );

      return plainToInstance(ComplianceStatusDto, {
        isCompliant,
        canCreateToken: isCompliant,
        outstandingLevies: outstandingLevies.map(levy => 
          plainToInstance(LevyResponseDto, levy instanceof Object && 'toObject' in levy ? levy.toObject() : levy, { excludeExtraneousValues: true })
        ),
        totalOutstanding,
      });
    } catch (error) {
      this.logger.error(`Error checking compliance for user ${userId}: ${error.message}`);
      // In case of error, allow token creation (fail-open for better UX)
      return plainToInstance(ComplianceStatusDto, {
        isCompliant: true,
        canCreateToken: true,
        outstandingLevies: [],
        totalOutstanding: 0,
      });
    }
  }
}
