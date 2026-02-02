import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllAuditLogsQuery } from '../impl/audit-log-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../../../entities/audit-log.entity';

@QueryHandler(FindAllAuditLogsQuery)
export class FindAllAuditLogsHandler implements IQueryHandler<FindAllAuditLogsQuery> {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async execute(query: FindAllAuditLogsQuery): Promise<AuditLog[]> {
    const { query: filter, options } = query;
    return this.auditLogModel
      .find(filter)
      .limit(options.limit || 100)
      .skip(options.skip || 0)
      .sort(options.sort || { timestamp: -1 })
      .populate('userId', 'firstName lastName email')
      .exec();
  }
}
