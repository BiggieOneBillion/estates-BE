import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { FindAuditLogsByUserQuery, FindAllAuditLogsQuery } from '../impl/audit-log-queries.impl';
import { AuditLog } from '../../../entities/audit-log.entity';

@QueryHandler(FindAuditLogsByUserQuery)
export class FindAuditLogsByUserHandler implements IQueryHandler<FindAuditLogsByUserQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: FindAuditLogsByUserQuery): Promise<AuditLog[]> {
    return this.queryBus.execute(new FindAllAuditLogsQuery({ userId: query.userId }));
  }
}
