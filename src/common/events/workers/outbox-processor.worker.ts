// src/common/events/workers/outbox-processor.worker.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { OutboxEvent, OutboxEventStatus } from '../entities/outbox.entity';
import { EventDispatcher } from '../services/event-dispatcher.service';

@Injectable()
export class OutboxProcessorWorker implements OnModuleInit {
  private readonly logger = new Logger(OutboxProcessorWorker.name);
  private worker: Worker;
  private queue: Queue;

  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEvent>,
    private readonly eventDispatcher: EventDispatcher,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeWorker();
    await this.startPolling();
  }

  /**
   * Initialize BullMQ worker and queue
   */
  private async initializeWorker(): Promise<void> {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    };

    // Create queue
    this.queue = new Queue('outbox-processor', {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute
        },
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
          age: 24 * 3600, // Keep for 24 hours
        },
        removeOnFail: false, // Keep failed jobs for debugging
      },
    });

    // Create worker
    this.worker = new Worker(
      'outbox-processor',
      async (job) => {
        const outboxEntry = await this.outboxModel.findById(job.data.outboxId);

        if (!outboxEntry) {
          this.logger.warn(`Outbox entry ${job.data.outboxId} not found`);
          return;
        }

        await this.eventDispatcher.dispatch(outboxEntry);
      },
      {
        connection: redisConfig,
        concurrency: 10, // Process 10 events concurrently
      },
    );

    // Worker event listeners
    this.worker.on('completed', (job) => {
      this.logger.debug(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`, err.stack);
    });

    this.worker.on('error', (err) => {
      this.logger.error(`Worker error: ${err.message}`, err.stack);
    });

    this.logger.log('Outbox processor worker initialized');
  }

  /**
   * Start polling the outbox table for pending events
   */
  private async startPolling(): Promise<void> {
    const pollInterval = 5000; // 5 seconds

    setInterval(async () => {
      try {
        await this.pollOutbox();
      } catch (error) {
        this.logger.error(
          `Error polling outbox: ${error.message}`,
          error.stack,
        );
      }
    }, pollInterval);

    this.logger.log(`Started polling outbox every ${pollInterval}ms`);
  }

  /**
   * Poll the outbox table for pending events
   */
  private async pollOutbox(): Promise<void> {
    const now = new Date();

    // Find pending events that are ready to be processed
    const pendingEvents = await this.outboxModel
      .find({
        status: OutboxEventStatus.PENDING,
        $or: [{ nextRetryAt: { $exists: false } }, { nextRetryAt: { $lte: now } }],
      })
      .sort({ createdAt: 1 }) // Process oldest first
      .limit(10) // Process in batches of 10
      .exec();

    if (pendingEvents.length === 0) {
      return;
    }

    this.logger.debug(`Found ${pendingEvents.length} pending events to process`);

    // Add events to the queue
    const jobs = pendingEvents.map((event) => ({
      name: `process-${event.eventType}`,
      data: { outboxId: event._id.toString() },
      opts: {
        jobId: event.eventId, // Use eventId as job ID to prevent duplicates
      },
    }));

    await this.queue.addBulk(jobs);

    this.logger.debug(`Added ${jobs.length} events to processing queue`);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }

  /**
   * Clean up resources on module destroy
   */
  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Outbox processor worker closed');
    }

    if (this.queue) {
      await this.queue.close();
      this.logger.log('Outbox processor queue closed');
    }
  }
}
