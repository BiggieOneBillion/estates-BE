// src/common/events/services/event-dispatcher.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventHandler } from '../interfaces/event-handler.interface';
import { OutboxEvent, OutboxEventStatus } from '../entities/outbox.entity';
import { BaseDomainEvent } from '../domain/base-domain-event';
import { DeadLetterQueueService } from './dead-letter-queue.service';

@Injectable()
export class EventDispatcher {
  private readonly logger = new Logger(EventDispatcher.name);
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEvent>,
    private readonly deadLetterQueueService: DeadLetterQueueService,
  ) {}

  /**
   * Register an event handler for a specific event type
   * @param eventType The event type to handle
   * @param handler The handler instance
   */
  registerHandler(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);
    this.logger.log(
      `Registered handler ${handler.getHandlerName?.() || handler.constructor.name} for event type ${eventType}`,
    );
  }

  /**
   * Register multiple handlers at once
   * @param handlers Array of event handlers
   */
  registerHandlers(handlers: EventHandler[]): void {
    handlers.forEach((handler) => {
      this.registerHandler(handler.getEventType(), handler);
    });
  }

  /**
   * Dispatch an event from the outbox to its registered handlers
   * @param outboxEntry The outbox entry to dispatch
   */
  async dispatch(outboxEntry: OutboxEvent): Promise<void> {
    const handlers = this.handlers.get(outboxEntry.eventType) || [];
    const correlationId = outboxEntry.correlationId;

    if (handlers.length === 0) {
      this.logger.warn(
        `[${correlationId}] No handlers registered for event type ${outboxEntry.eventType}`,
      );
      await this.handleSuccess(outboxEntry);
      return;
    }

    try {
      // Mark as processing
      await this.outboxModel.updateOne(
        { _id: outboxEntry._id },
        { status: OutboxEventStatus.PROCESSING },
      );

      const handlerStatus = outboxEntry.handlerStatus || new Map();
      let hasFailures = false;
      const errors: Error[] = [];

      for (const handler of handlers) {
        const handlerName =
          handler.getHandlerName?.() || handler.constructor.name;

        // Skip if already completed
        if (handlerStatus.get(handlerName) === 'completed') {
          this.logger.debug(
            `[${correlationId}] Skipping already completed handler ${handlerName} for event ${outboxEntry.eventType}`,
          );
          continue;
        }

        try {
          await this.executeHandler(handler, outboxEntry);
          handlerStatus.set(handlerName, 'completed');
        } catch (error) {
          this.logger.error(
            `[${correlationId}] Handler ${handlerName} failed for event ${outboxEntry.eventType}: ${error.message}`,
          );
          handlerStatus.set(handlerName, 'failed');
          hasFailures = true;
          errors.push(error);
        }

        // Update handler status in database incrementally
        await this.outboxModel.updateOne(
          { _id: outboxEntry._id },
          { handlerStatus },
        );
      }

      if (hasFailures) {
        throw new Error(
          `Some handlers failed: ${errors.map((e) => e.message).join(', ')}`,
        );
      }

      // Mark as completed
      await this.handleSuccess(outboxEntry);

      this.logger.log(
        `[${correlationId}] Successfully dispatched event ${outboxEntry.eventType} (ID: ${outboxEntry.eventId})`,
      );
    } catch (error) {
      this.logger.error(
        `[${correlationId}] Failed to dispatch event ${outboxEntry.eventType} (ID: ${outboxEntry.eventId}): ${error.message}`,
      );
      await this.handleFailure(outboxEntry, error);
    }
  }

  /**
   * Execute a single handler with error handling
   */
  private async executeHandler(
    handler: EventHandler,
    outboxEntry: OutboxEvent,
  ): Promise<void> {
    // Reconstruct the domain event from the payload
    const event = this.reconstructEvent(outboxEntry);
    await handler.handle(event);

    this.logger.debug(
      `[${outboxEntry.correlationId}] Handler ${handler.getHandlerName?.() || handler.constructor.name} completed for event ${outboxEntry.eventType}`,
    );
  }

  /**
   * Reconstruct a domain event from outbox payload
   */
  private reconstructEvent(outboxEntry: OutboxEvent): BaseDomainEvent {
    const data = outboxEntry.payload.payload || outboxEntry.payload;

    return {
      eventId: outboxEntry.eventId,
      eventType: outboxEntry.eventType,
      aggregateId: outboxEntry.aggregateId,
      aggregateType: outboxEntry.aggregateType,
      version: outboxEntry.version || 1,
      occurredAt: outboxEntry.createdAt as any as Date,
      metadata: {
        ...(outboxEntry.metadata || {}),
        correlationId: outboxEntry.correlationId,
      },
      getPayload: () => data,
      toJSON: () => ({
        eventId: outboxEntry.eventId,
        eventType: outboxEntry.eventType,
        aggregateId: outboxEntry.aggregateId,
        aggregateType: outboxEntry.aggregateType,
        version: outboxEntry.version || 1,
        occurredAt: outboxEntry.createdAt,
        metadata: {
          ...(outboxEntry.metadata || {}),
          correlationId: outboxEntry.correlationId,
        },
        payload: data,
      }),
    } as any as BaseDomainEvent;
  }

  /**
   * Handle successful event processing
   */
  async handleSuccess(outboxEntry: OutboxEvent): Promise<void> {
    await this.outboxModel.updateOne(
      { _id: outboxEntry._id },
      {
        status: OutboxEventStatus.COMPLETED,
        processedAt: new Date(),
      },
    );
  }

  /**
   * Handle failed event processing with retry logic
   */
  async handleFailure(outboxEntry: OutboxEvent, error: Error): Promise<void> {
    const retryCount = outboxEntry.retryCount + 1;
    const maxRetries = outboxEntry.maxRetries;

    if (retryCount >= maxRetries) {
      // Max retries reached, mark as failed and move to dead letter queue
      await this.outboxModel.updateOne(
        { _id: outboxEntry._id },
        {
          status: OutboxEventStatus.FAILED,
          retryCount,
          error: error.message,
          processedAt: new Date(),
        },
      );

      this.logger.error(
        `Event ${outboxEntry.eventType} (ID: ${outboxEntry.eventId}) failed after ${maxRetries} retries`,
      );

      // Move to dead letter queue
      try {
        await this.deadLetterQueueService.moveToDeadLetterQueue(outboxEntry);
      } catch (dlqError) {
        this.logger.error(
          `Failed to move event to dead letter queue: ${dlqError.message}`,
          dlqError.stack,
        );
      }
    } else {
      // Calculate next retry time with exponential backoff
      const nextRetryAt = this.calculateNextRetry(retryCount);

      await this.outboxModel.updateOne(
        { _id: outboxEntry._id },
        {
          status: OutboxEventStatus.PENDING,
          retryCount,
          nextRetryAt,
          error: error.message,
        },
      );

      this.logger.warn(
        `Event ${outboxEntry.eventType} (ID: ${outboxEntry.eventId}) will retry at ${nextRetryAt} (attempt ${retryCount}/${maxRetries})`,
      );
    }
  }

  /**
   * Calculate next retry time with exponential backoff
   * Backoff: 1min, 2min, 4min, 8min, 16min
   */
  private calculateNextRetry(retryCount: number): Date {
    const baseDelayMs = 60 * 1000; // 1 minute
    const delayMs = baseDelayMs * Math.pow(2, retryCount - 1);
    return new Date(Date.now() + delayMs);
  }

  /**
   * Get statistics about registered handlers
   */
  getHandlerStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.handlers.forEach((handlers, eventType) => {
      stats[eventType] = handlers.length;
    });
    return stats;
  }
}
