import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { GetEstateComplianceReportQuery, CheckUserComplianceQuery } from '../impl/compliance-queries.impl';
import { FindByEstateQuery } from '../../../../users/cqrs/queries/impl/find-by-estate.query';
import { plainToInstance } from 'class-transformer';
import { EstateComplianceReportDto } from '../dto/compliance.response.dto';

@QueryHandler(GetEstateComplianceReportQuery)
export class GetEstateComplianceReportHandler implements IQueryHandler<GetEstateComplianceReportQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetEstateComplianceReportQuery): Promise<EstateComplianceReportDto> {
    const { estateId } = query;
    // Get all users in the estate
    const users = await this.queryBus.execute(new FindByEstateQuery(estateId));
    
    const report: any = {
      totalUsers: users.length,
      compliantUsers: 0,
      nonCompliantUsers: 0,
      totalOutstanding: 0,
      userDetails: [],
    };

    for (const user of users) {
      const compliance = await this.queryBus.execute(new CheckUserComplianceQuery((user._id as any).toString()));
      
      if (compliance.isCompliant) {
        report.compliantUsers++;
      } else {
        report.nonCompliantUsers++;
        report.totalOutstanding += compliance.totalOutstanding;
      }

      report.userDetails.push({
        userId: (user._id as any).toString(),
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.primaryRole,
        isCompliant: compliance.isCompliant,
        outstandingAmount: compliance.totalOutstanding,
        outstandingLeviesCount: compliance.outstandingLevies.length,
      });
    }

    return plainToInstance(EstateComplianceReportDto, report, { excludeExtraneousValues: true });
  }
}
