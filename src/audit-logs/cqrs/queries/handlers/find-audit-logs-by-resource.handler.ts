import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { FindAuditLogsByResourceQuery, FindAllAuditLogsQuery } from '../impl/audit-log-queries.impl';
import { AuditLog } from '../../../entities/audit-log.entity';

@QueryHandler(FindAuditLogsByResourceQuery)
export class FindAuditLogsByResourceHandler implements IQueryHandler<FindAuditLogsByResourceQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: FindAuditLogsByResourceQuery): Promise<AuditLog[]> {
    const { resource, resourceId } = query;
    const filter: any = { resource };
    if (resourceId) {
      filter.resourceId = resourceId;
    }
    return this.queryBus.execute(new FindAllAuditLogsQuery(filter));
  }
}
