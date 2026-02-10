// src/common/events/events-infrastructure.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
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
  UserVerificationEmailRequestedHandler,
  UserSecurityAlertHandler,
  UserAccountCreatedHandler,
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
import { AuditLogHandler } from 'src/audit-logs/handlers/audit-log.handler';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: OutboxEvent.name, schema: OutboxEventSchema },
      { name: DeadLetterEvent.name, schema: DeadLetterEventSchema },
    ]),
    CqrsModule,
  ],
  providers: [
    // Core services
    EventPublisher,
    EventDispatcher,
    DeadLetterQueueService,
    OutboxProcessorWorker,
    MailService,

    // Audit handler
    AuditLogHandler,

    // User event handlers
    UserCreatedHandler,
    UserVerifiedHandler,
    UserLoggedInHandler,
    UserPasswordResetRequestedHandler,
    UserPasswordResetCompletedHandler,
    UserVerificationEmailRequestedHandler,
    UserSecurityAlertHandler,
    UserAccountCreatedHandler,

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
    private readonly userVerificationEmailRequestedHandler: UserVerificationEmailRequestedHandler,
    private readonly userSecurityAlertHandler: UserSecurityAlertHandler,
    private readonly userAccountCreatedHandler: UserAccountCreatedHandler,
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
    private readonly auditLogHandler: AuditLogHandler,
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
      this.userVerificationEmailRequestedHandler,
      this.userSecurityAlertHandler,
      this.userAccountCreatedHandler,
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

    // Register AuditLogHandler for all event types
    const eventTypes = [
      'user.created', 'user.verified', 'user.logged_in', 
      'user.password_reset_requested', 'user.password_reset_completed',
      'user.verification_email_requested', 'user.security_alert',
      'user.account_created',
      'payment.initiated', 'payment.completed', 'payment.failed', 'payment.refunded',
      'levy.created', 'levy.due_reminder', 'levy.overdue', 'levy.paid'
    ];
    
    eventTypes.forEach(type => {
      this.eventDispatcher.registerHandler(type, this.auditLogHandler);
    });
  }
}
