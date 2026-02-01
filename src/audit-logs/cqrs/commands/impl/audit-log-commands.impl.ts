import { AuditLog } from '../../../entities/audit-log.entity';

export class CreateAuditLogCommand {
  constructor(public readonly data: Partial<AuditLog>) {}
}
