import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { FindAuditLogsByUserQuery, FindAllAuditLogsQuery } from '../impl/audit-log-queries.impl';
import { AuditLogResponseDto } from '../../../dto/response/audit-log.response.dto';

@QueryHandler(FindAuditLogsByUserQuery)
export class FindAuditLogsByUserHandler implements IQueryHandler<FindAuditLogsByUserQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: FindAuditLogsByUserQuery): Promise<AuditLogResponseDto[]> {
    return this.queryBus.execute(new FindAllAuditLogsQuery({ userId: query.userId }));
  }
}
