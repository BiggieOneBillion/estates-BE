// src/common/events/services/dead-letter-queue.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxEvent } from '../entities/outbox.entity';
import {
  DeadLetterEvent,
} from '../entities/dead-letter-event.entity';

@Injectable()
export class DeadLetterQueueService {
  private readonly logger = new Logger(DeadLetterQueueService.name);

  constructor(
    @InjectModel(DeadLetterEvent.name)
    private readonly deadLetterModel: Model<DeadLetterEvent>,
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEvent>,
  ) {}

  /**
   * Move a failed event to the dead letter queue
   * @param outboxEvent The failed outbox event
   */
  async moveToDeadLetterQueue(outboxEvent: OutboxEvent): Promise<void> {
    try {
      const deadLetterEvent = new this.deadLetterModel({
        originalEventId: outboxEvent.eventId,
        eventType: outboxEvent.eventType,
        aggregateId: outboxEvent.aggregateId,
        aggregateType: outboxEvent.aggregateType,
        payload: outboxEvent.payload,
        failureReason: outboxEvent.error || 'Unknown error',
        retryCount: outboxEvent.retryCount,
        firstFailedAt: new Date(), // Use current date as approximation
        lastFailedAt: new Date(),
        metadata: outboxEvent.metadata,
        isResolved: false,
      });

      await deadLetterEvent.save();

      this.logger.error(
        `Event ${outboxEvent.eventType} (ID: ${outboxEvent.eventId}) moved to dead letter queue after ${outboxEvent.retryCount} retries`,
      );

      // Optionally, send alert to administrators
      await this.sendAdminAlert(outboxEvent);
    } catch (error) {
      this.logger.error(
        `Failed to move event to dead letter queue: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all unresolved dead letter events
   */
  async getUnresolvedEvents(): Promise<DeadLetterEvent[]> {
    return this.deadLetterModel
      .find({ isResolved: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get dead letter events by type
   */
  async getEventsByType(eventType: string): Promise<DeadLetterEvent[]> {
    return this.deadLetterModel
      .find({ eventType, isResolved: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Retry a dead letter event
   * @param deadLetterEventId The ID of the dead letter event to retry
   */
  async retryEvent(deadLetterEventId: string): Promise<void> {
    const deadLetterEvent = await this.deadLetterModel.findById(
      deadLetterEventId,
    );

    if (!deadLetterEvent) {
      throw new Error('Dead letter event not found');
    }

    if (deadLetterEvent.isResolved) {
      throw new Error('Event is already resolved');
    }

    try {
      // Create a new outbox event from the dead letter event
      const newOutboxEvent = new this.outboxModel({
        eventId: deadLetterEvent.originalEventId + '-retry-' + Date.now(),
        eventType: deadLetterEvent.eventType,
        aggregateId: deadLetterEvent.aggregateId,
        aggregateType: deadLetterEvent.aggregateType,
        payload: deadLetterEvent.payload,
        status: 'pending',
        retryCount: 0,
        maxRetries: 5,
        metadata: {
          ...deadLetterEvent.metadata,
          retriedFromDeadLetter: true,
          originalEventId: deadLetterEvent.originalEventId,
        },
      });

      await newOutboxEvent.save();

      this.logger.log(
        `Dead letter event ${deadLetterEvent.originalEventId} queued for retry`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to retry dead letter event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Mark a dead letter event as resolved
   * @param deadLetterEventId The ID of the dead letter event
   * @param resolvedBy Who resolved it (user ID or system)
   * @param notes Resolution notes
   */
  async markAsResolved(
    deadLetterEventId: string,
    resolvedBy: string,
    notes?: string,
  ): Promise<void> {
    await this.deadLetterModel.updateOne(
      { _id: deadLetterEventId },
      {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        resolutionNotes: notes,
      },
    );

    this.logger.log(
      `Dead letter event ${deadLetterEventId} marked as resolved by ${resolvedBy}`,
    );
  }

  /**
   * Get statistics about dead letter events
   */
  async getStatistics() {
    const [total, unresolved, byType] = await Promise.all([
      this.deadLetterModel.countDocuments(),
      this.deadLetterModel.countDocuments({ isResolved: false }),
      this.deadLetterModel.aggregate([
        { $match: { isResolved: false } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      total,
      unresolved,
      byType: byType.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Send alert to administrators about critical failures
   */
  private async sendAdminAlert(outboxEvent: OutboxEvent): Promise<void> {
    // TODO: Implement admin alerting
    // This could be:
    // - Email to admin
    // - Slack/Discord webhook
    // - Push notification
    // - Log to monitoring system (e.g., Sentry)

    this.logger.warn(
      `ADMIN ALERT: Critical event failure - ${outboxEvent.eventType} (ID: ${outboxEvent.eventId})`,
    );
  }

  /**
   * Clean up old resolved events (for maintenance)
   * @param daysOld Number of days to keep resolved events
   */
  async cleanupResolvedEvents(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deadLetterModel.deleteMany({
      isResolved: true,
      resolvedAt: { $lt: cutoffDate },
    });

    this.logger.log(
      `Cleaned up ${result.deletedCount} resolved dead letter events older than ${daysOld} days`,
    );

    return result.deletedCount;
  }
}
