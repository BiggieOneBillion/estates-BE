// src/common/events/events-infrastructure.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OutboxEvent, OutboxEventSchema } from './entities/outbox.entity';
import {
  DeadLetterEvent,
  DeadLetterEventSchema,
} from './entities/dead-letter-event.entity';
import { EventPublisher } from './services/event-publisher.service';
import { EventDispatcher } from './services/event-dispatcher.service';
import { DeadLetterQueueService } from './services/dead-letter-queue.service';
import { OutboxProcessorWorker } from './workers/outbox-processor.worker';
import {
  UserCreatedHandler,
  UserVerifiedHandler,
  UserLoggedInHandler,
  UserPasswordResetRequestedHandler,
  UserPasswordResetCompletedHandler,
} from './handlers/user-event.handlers';
import {
  PaymentInitiatedHandler,
  PaymentCompletedHandler,
  PaymentFailedHandler,
  PaymentRefundedHandler,
} from './handlers/payment-event.handlers';
import {
  LevyCreatedHandler,
  LevyDueReminderHandler,
  LevyOverdueHandler,
  LevyPaidHandler,
} from './handlers/levy-event.handlers';
import { MailService } from '../services/mail.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: OutboxEvent.name, schema: OutboxEventSchema },
      { name: DeadLetterEvent.name, schema: DeadLetterEventSchema },
    ]),
  ],
  providers: [
    // Core services
    EventPublisher,
    EventDispatcher,
    DeadLetterQueueService,
    OutboxProcessorWorker,
    MailService,

    // User event handlers
    UserCreatedHandler,
    UserVerifiedHandler,
    UserLoggedInHandler,
    UserPasswordResetRequestedHandler,
    UserPasswordResetCompletedHandler,

    // Payment event handlers
    PaymentInitiatedHandler,
    PaymentCompletedHandler,
    PaymentFailedHandler,
    PaymentRefundedHandler,

    // Levy event handlers
    LevyCreatedHandler,
    LevyDueReminderHandler,
    LevyOverdueHandler,
    LevyPaidHandler,
  ],
  exports: [EventPublisher, DeadLetterQueueService], // Export for use in other modules
})
export class EventsInfrastructureModule {
  constructor(
    private readonly eventDispatcher: EventDispatcher,
    // User handlers
    private readonly userCreatedHandler: UserCreatedHandler,
    private readonly userVerifiedHandler: UserVerifiedHandler,
    private readonly userLoggedInHandler: UserLoggedInHandler,
    private readonly userPasswordResetRequestedHandler: UserPasswordResetRequestedHandler,
    private readonly userPasswordResetCompletedHandler: UserPasswordResetCompletedHandler,
    // Payment handlers
    private readonly paymentInitiatedHandler: PaymentInitiatedHandler,
    private readonly paymentCompletedHandler: PaymentCompletedHandler,
    private readonly paymentFailedHandler: PaymentFailedHandler,
    private readonly paymentRefundedHandler: PaymentRefundedHandler,
    // Levy handlers
    private readonly levyCreatedHandler: LevyCreatedHandler,
    private readonly levyDueReminderHandler: LevyDueReminderHandler,
    private readonly levyOverdueHandler: LevyOverdueHandler,
    private readonly levyPaidHandler: LevyPaidHandler,
  ) {
    // Register all handlers on module initialization
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.eventDispatcher.registerHandlers([
      // User handlers
      this.userCreatedHandler,
      this.userVerifiedHandler,
      this.userLoggedInHandler,
      this.userPasswordResetRequestedHandler,
      this.userPasswordResetCompletedHandler,
      // Payment handlers
      this.paymentInitiatedHandler,
      this.paymentCompletedHandler,
      this.paymentFailedHandler,
      this.paymentRefundedHandler,
      // Levy handlers
      this.levyCreatedHandler,
      this.levyDueReminderHandler,
      this.levyOverdueHandler,
      this.levyPaidHandler,
    ]);
  }
}
