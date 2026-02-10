import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { GetOutstandingLeviesQuery, CheckUserComplianceQuery } from '../impl/compliance-queries.impl';
import { LevyResponseDto } from '../../../../levies/dto/response/levy.response.dto';

@QueryHandler(GetOutstandingLeviesQuery)
export class GetOutstandingLeviesHandler implements IQueryHandler<GetOutstandingLeviesQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetOutstandingLeviesQuery): Promise<LevyResponseDto[]> {
    const compliance = await this.queryBus.execute(new CheckUserComplianceQuery(query.userId));
    return compliance.outstandingLevies;
  }
}
