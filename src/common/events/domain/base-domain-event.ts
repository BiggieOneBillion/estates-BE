// src/common/events/domain/base-domain-event.ts
import { randomUUID } from 'crypto';

export interface DomainEventMetadata {
  userId?: string;
  correlationId?: string;
  causationId?: string;
  [key: string]: any;
}

export abstract class BaseDomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly metadata: DomainEventMetadata;

  public readonly version: number;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    metadata: DomainEventMetadata = {},
    version: number = 1,
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
    this.version = version;
    this.metadata = {
      correlationId: metadata.correlationId || randomUUID(),
      ...metadata,
    };
  }

  abstract getPayload(): Record<string, any>;

  toJSON(): Record<string, any> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      occurredAt: this.occurredAt,
      metadata: this.metadata,
      payload: this.getPayload(),
    };
  }
}
