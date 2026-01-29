// src/common/events/interfaces/event-handler.interface.ts
import { BaseDomainEvent } from '../domain/base-domain-event';

export interface EventHandler<T extends BaseDomainEvent = BaseDomainEvent> {
  /**
   * Handle the domain event
   * @param event The domain event to handle
   */
  handle(event: T): Promise<void>;

  /**
   * Get the event type this handler is responsible for
   */
  getEventType(): string;

  /**
   * Optional: Get handler name for logging
   */
  getHandlerName?(): string;
}
