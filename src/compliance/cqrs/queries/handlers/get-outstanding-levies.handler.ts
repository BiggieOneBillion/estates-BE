import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { GetOutstandingLeviesQuery, CheckUserComplianceQuery } from '../impl/compliance-queries.impl';
import { Levy } from '../../../../levies/entities/levy.entity';

@QueryHandler(GetOutstandingLeviesQuery)
export class GetOutstandingLeviesHandler implements IQueryHandler<GetOutstandingLeviesQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetOutstandingLeviesQuery): Promise<Levy[]> {
    const compliance = await this.queryBus.execute(new CheckUserComplianceQuery(query.userId));
    return compliance.outstandingLevies;
  }
}
