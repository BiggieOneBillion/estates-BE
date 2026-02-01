import { Injectable, Logger } from '@nestjs/common';
import { EventHandler } from 'src/common/events/interfaces/event-handler.interface';
import { BaseDomainEvent } from 'src/common/events/domain/base-domain-event';
import { AuditLogsService } from '../audit-logs.service';

@Injectable()
export class AuditLogHandler implements EventHandler {
  private readonly logger = new Logger(AuditLogHandler.name);

  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * Return a wildcard or a list of events this handler handles.
   * Since the EventDispatcher requires a single event type per handler,
   * we will need to register this handler for each event type we want to audit.
   */
  getEventType(): string {
    return '*'; // This is just a placeholder, we'll register it for multiple types
  }

  async handle(event: BaseDomainEvent): Promise<void> {
    try {
      this.logger.debug(`Auditing event: ${event.eventType}`);
      
      const payload = event.getPayload();
      const metadata = event.metadata || {};

      await this.auditLogsService.create({
        userId: metadata.userId || (payload as any).userId || (payload as any).actorId,
        action: event.eventType,
        resource: event.aggregateType,
        resourceId: event.aggregateId,
        payload,
        metadata: {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          estateId: metadata.estateId || (payload as any).estateId,
        },
        timestamp: event.occurredAt,
      });
    } catch (error) {
      this.logger.error(`Failed to audit event ${event.eventType}: ${error.message}`);
      // We don't throw here to avoid failing the main event processing
    }
  }
}
