// src/common/events/events-infrastructure.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OutboxEvent, OutboxEventSchema } from './entities/outbox.entity';
import { EventPublisher } from './services/event-publisher.service';
import { EventDispatcher } from './services/event-dispatcher.service';
import { OutboxProcessorWorker } from './workers/outbox-processor.worker';
import {
  UserCreatedHandler,
  UserVerifiedHandler,
  UserLoggedInHandler,
  UserPasswordResetRequestedHandler,
  UserPasswordResetCompletedHandler,
} from './handlers/user-event.handlers';
import { MailService } from '../services/mail.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: OutboxEvent.name, schema: OutboxEventSchema },
    ]),
  ],
  providers: [
    // Core services
    EventPublisher,
    EventDispatcher,
    OutboxProcessorWorker,
    MailService,

    // User event handlers
    UserCreatedHandler,
    UserVerifiedHandler,
    UserLoggedInHandler,
    UserPasswordResetRequestedHandler,
    UserPasswordResetCompletedHandler,
  ],
  exports: [EventPublisher], // Export for use in other modules
})
export class EventsInfrastructureModule {
  constructor(
    private readonly eventDispatcher: EventDispatcher,
    private readonly userCreatedHandler: UserCreatedHandler,
    private readonly userVerifiedHandler: UserVerifiedHandler,
    private readonly userLoggedInHandler: UserLoggedInHandler,
    private readonly userPasswordResetRequestedHandler: UserPasswordResetRequestedHandler,
    private readonly userPasswordResetCompletedHandler: UserPasswordResetCompletedHandler,
  ) {
    // Register all handlers on module initialization
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.eventDispatcher.registerHandlers([
      this.userCreatedHandler,
      this.userVerifiedHandler,
      this.userLoggedInHandler,
      this.userPasswordResetRequestedHandler,
      this.userPasswordResetCompletedHandler,
    ]);
  }
}
