import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAuditLogCommand } from '../impl/audit-log-commands.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../../../entities/audit-log.entity';
import { Logger } from '@nestjs/common';

@CommandHandler(CreateAuditLogCommand)
export class CreateAuditLogHandler implements ICommandHandler<CreateAuditLogCommand> {
  private readonly logger = new Logger(CreateAuditLogHandler.name);

  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async execute(command: CreateAuditLogCommand): Promise<AuditLog> {
    try {
      const log = new this.auditLogModel(command.data);
      return await log.save();
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }
}
