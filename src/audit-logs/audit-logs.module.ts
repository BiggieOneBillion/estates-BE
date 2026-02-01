import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog, AuditLogSchema } from './entities/audit-log.entity';
import { AuditLogHandler } from './handlers/audit-log.handler';
import { AuditLogsController } from './audit-logs.controller';

import { CreateAuditLogHandler } from './cqrs/commands/handlers/create-audit-log.handler';
import { FindAllAuditLogsHandler } from './cqrs/queries/handlers/find-all-audit-logs.handler';
import { GetAuditLogStatsHandler } from './cqrs/queries/handlers/get-audit-log-stats.handler';
import { FindAuditLogsByResourceHandler } from './cqrs/queries/handlers/find-audit-logs-by-resource.handler';
import { FindAuditLogsByUserHandler } from './cqrs/queries/handlers/find-audit-logs-by-user.handler';

export const CommandHandlers = [CreateAuditLogHandler];
export const QueryHandlers = [
  FindAllAuditLogsHandler,
  GetAuditLogStatsHandler,
  FindAuditLogsByResourceHandler,
  FindAuditLogsByUserHandler,
];

@Global()
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService, 
    AuditLogHandler,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuditLogsService, AuditLogHandler],
})
export class AuditLogsModule {}
