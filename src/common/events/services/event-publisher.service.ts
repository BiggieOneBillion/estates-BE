// src/common/events/services/event-publisher.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { BaseDomainEvent } from '../domain/base-domain-event';
import { OutboxEvent, OutboxEventStatus } from '../entities/outbox.entity';

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEvent>,
  ) {}

  /**
   * Publish a single event to the outbox
   * @param event Domain event to publish
   * @param session Optional MongoDB session for transaction support
   */
  async publish(
    event: BaseDomainEvent,
    session?: ClientSession,
  ): Promise<void> {
    try {
      const outboxEntry = new this.outboxModel({
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        version: event.version || 1,
        correlationId: event.metadata.correlationId,
        payload: event.getPayload(),
        status: OutboxEventStatus.PENDING,
        retryCount: 0,
        maxRetries: 5,
        metadata: event.metadata,
      });

      await outboxEntry.save({ session });

      this.logger.log(
        `Published event ${event.eventType} with ID ${event.eventId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish event ${event.eventType}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Publish multiple events in a batch
   * @param events Array of domain events to publish
   * @param session Optional MongoDB session for transaction support
   */
  async publishBatch(
    events: BaseDomainEvent[],
    session?: ClientSession,
  ): Promise<void> {
    if (events.length === 0) {
      return;
    }

    try {
      const outboxEntries = events.map(
        (event) =>
          new this.outboxModel({
            eventId: event.eventId,
            eventType: event.eventType,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            version: event.version || 1,
            correlationId: event.metadata.correlationId,
            payload: event.getPayload(),
            status: OutboxEventStatus.PENDING,
            retryCount: 0,
            maxRetries: 5,
            metadata: event.metadata,
          }),
      );

      await this.outboxModel.insertMany(outboxEntries, { session });

      this.logger.log(`Published batch of ${events.length} events`);
    } catch (error) {
      this.logger.error(
        `Failed to publish batch of events: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Execute a business operation and publish an event in the same transaction
   * @param event Event to publish
   * @param operation Business operation to execute
   */
  async publishWithTransaction(
    event: BaseDomainEvent,
    operation: (session: ClientSession) => Promise<void>,
  ): Promise<void> {
    const session = await this.outboxModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        await operation(session);
        await this.publish(event, session);
      });

      this.logger.log(
        `Successfully executed operation and published event ${event.eventType}`,
      );
    } catch (error) {
      this.logger.error(
        `Transaction failed for event ${event.eventType}: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
