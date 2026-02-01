import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuditLogStatsQuery } from '../impl/audit-log-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../../../entities/audit-log.entity';

@QueryHandler(GetAuditLogStatsQuery)
export class GetAuditLogStatsHandler implements IQueryHandler<GetAuditLogStatsQuery> {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async execute(query: GetAuditLogStatsQuery): Promise<any> {
    return this.auditLogModel.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }
}
