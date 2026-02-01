import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async create(data: Partial<AuditLog>): Promise<AuditLog> {
    try {
      const log = new this.auditLogModel(data);
      return await log.save();
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(query: any = {}, options: { limit?: number; skip?: number; sort?: any } = {}) {
    return this.auditLogModel
      .find(query)
      .limit(options.limit || 100)
      .skip(options.skip || 0)
      .sort(options.sort || { timestamp: -1 })
      .populate('userId', 'firstName lastName email')
      .exec();
  }

  async findByResource(resource: string, resourceId?: string) {
    const query: any = { resource };
    if (resourceId) {
      query.resourceId = resourceId;
    }
    return this.findAll(query);
  }

  async findByUser(userId: string) {
    return this.findAll({ userId });
  }

  async getStats() {
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
