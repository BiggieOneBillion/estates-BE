// src/common/events/handlers/levy-event.handlers.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventHandler } from '../interfaces/event-handler.interface';
import {
  LevyCreatedEvent,
  LevyDueReminderEvent,
  LevyOverdueEvent,
  LevyPaidEvent,
} from '../domain/levy-events';
import { MailService } from '../../services/mail.service';

@Injectable()
export class LevyCreatedHandler implements EventHandler<LevyCreatedEvent> {
  private readonly logger = new Logger(LevyCreatedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: LevyCreatedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(`Handling LevyCreatedEvent for levy ${payload.levyId}`);

    try {
      // Send notification to all estate residents
      this.logger.log(
        `New levy created: ${payload.title} - Amount: ${payload.amount} - Due: ${payload.dueDate}`,
      );

      // TODO: Fetch all estate residents and send notifications
      // This would typically involve querying users by estateId
      // and sending individual emails or push notifications
    } catch (error) {
      this.logger.error(
        `Failed to handle levy created event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'levy.created';
  }

  getHandlerName(): string {
    return 'LevyCreatedHandler';
  }
}

@Injectable()
export class LevyDueReminderHandler
  implements EventHandler<LevyDueReminderEvent>
{
  private readonly logger = new Logger(LevyDueReminderHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: LevyDueReminderEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling LevyDueReminderEvent for levy ${payload.levyId} - User ${payload.userId}`,
    );

    try {
      // Send reminder email
      await this.mailService.sendBasicEmail(
        payload.userEmail,
        `Reminder: ${payload.title} Due Soon`,
        `Hello ${payload.userName},\n\nThis is a reminder that your levy payment of ${payload.amount} for "${payload.title}" is due in ${payload.daysUntilDue} days (${payload.dueDate.toLocaleDateString()}).\n\nPlease ensure timely payment to avoid penalties.\n\nThank you.`,
      );

      this.logger.log(
        `Levy reminder sent to ${payload.userEmail} for levy ${payload.levyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send levy reminder to ${payload.userEmail}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'levy.due_reminder';
  }

  getHandlerName(): string {
    return 'LevyDueReminderHandler';
  }
}

@Injectable()
export class LevyOverdueHandler implements EventHandler<LevyOverdueEvent> {
  private readonly logger = new Logger(LevyOverdueHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: LevyOverdueEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling LevyOverdueEvent for levy ${payload.levyId} - User ${payload.userId}`,
    );

    try {
      // Send overdue notification
      await this.mailService.sendBasicEmail(
        payload.userEmail,
        `OVERDUE: ${payload.title}`,
        `Hello ${payload.userName},\n\nYour levy payment of ${payload.amount} for "${payload.title}" is now ${payload.daysOverdue} days overdue (was due on ${payload.dueDate.toLocaleDateString()}).\n\nPlease make payment immediately to avoid further penalties.\n\nThank you.`,
      );

      this.logger.warn(
        `Levy overdue notification sent to ${payload.userEmail} for levy ${payload.levyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send levy overdue notification to ${payload.userEmail}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'levy.overdue';
  }

  getHandlerName(): string {
    return 'LevyOverdueHandler';
  }
}

@Injectable()
export class LevyPaidHandler implements EventHandler<LevyPaidEvent> {
  private readonly logger = new Logger(LevyPaidHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: LevyPaidEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling LevyPaidEvent for levy ${payload.levyId} - User ${payload.userId}`,
    );

    try {
      // Send payment confirmation
      await this.mailService.sendBasicEmail(
        payload.userEmail,
        `Payment Confirmed: ${payload.title}`,
        `Hello ${payload.userName},\n\nThank you for your payment of ${payload.amount} for "${payload.title}".\n\nPayment ID: ${payload.paymentId}\nPaid on: ${payload.paidAt.toLocaleDateString()}\n\nYour payment has been recorded successfully.\n\nThank you.`,
      );

      this.logger.log(
        `Levy payment confirmation sent to ${payload.userEmail} for levy ${payload.levyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send levy payment confirmation to ${payload.userEmail}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'levy.paid';
  }

  getHandlerName(): string {
    return 'LevyPaidHandler';
  }
}
