import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { FindAuditLogsByResourceQuery, FindAllAuditLogsQuery } from '../impl/audit-log-queries.impl';
import { AuditLogResponseDto } from '../../../dto/response/audit-log.response.dto';

@QueryHandler(FindAuditLogsByResourceQuery)
export class FindAuditLogsByResourceHandler implements IQueryHandler<FindAuditLogsByResourceQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: FindAuditLogsByResourceQuery): Promise<AuditLogResponseDto[]> {
    const { resource, resourceId } = query;
    const filter: any = { resource };
    if (resourceId) {
      filter.resourceId = resourceId;
    }
    return this.queryBus.execute(new FindAllAuditLogsQuery(filter));
  }
}
