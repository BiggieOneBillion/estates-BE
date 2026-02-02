import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { GetEstateComplianceReportQuery, CheckUserComplianceQuery } from '../impl/compliance-queries.impl';
import { FindByEstateQuery } from '../../../../users/cqrs/queries/impl/find-by-estate.query';

@QueryHandler(GetEstateComplianceReportQuery)
export class GetEstateComplianceReportHandler implements IQueryHandler<GetEstateComplianceReportQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetEstateComplianceReportQuery): Promise<any> {
    const { estateId } = query;
    // Get all users in the estate
    const users = await this.queryBus.execute(new FindByEstateQuery(estateId));
    
    const report = {
      totalUsers: users.length,
      compliantUsers: 0,
      nonCompliantUsers: 0,
      totalOutstanding: 0,
      userDetails: [] as any[],
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
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.primaryRole,
        isCompliant: compliance.isCompliant,
        outstandingAmount: compliance.totalOutstanding,
        outstandingLeviesCount: compliance.outstandingLevies.length,
      });
    }

    return report;
  }
}
