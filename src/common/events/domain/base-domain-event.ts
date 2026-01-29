// src/common/events/domain/base-domain-event.ts
import { v4 as uuidv4 } from 'uuid';

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

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    metadata: DomainEventMetadata = {},
  ) {
    this.eventId = uuidv4();
    this.occurredAt = new Date();
    this.metadata = {
      correlationId: metadata.correlationId || uuidv4(),
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
