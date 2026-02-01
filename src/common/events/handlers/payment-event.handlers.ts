// src/common/events/handlers/payment-event.handlers.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventHandler } from '../interfaces/event-handler.interface';
import {
  PaymentInitiatedEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
} from '../domain/payment-events';
import { MailService } from '../../services/mail.service';

@Injectable()
export class PaymentInitiatedHandler
  implements EventHandler<PaymentInitiatedEvent>
{
  private readonly logger = new Logger(PaymentInitiatedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: PaymentInitiatedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling PaymentInitiatedEvent for payment ${payload.paymentId}`,
    );

    try {
      // You can add notification logic here
      // For now, just logging
      this.logger.log(
        `Payment initiated: ${payload.amount} ${payload.currency} by user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle payment initiated event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'payment.initiated';
  }

  getHandlerName(): string {
    return 'PaymentInitiatedHandler';
  }
}

@Injectable()
export class PaymentCompletedHandler
  implements EventHandler<PaymentCompletedEvent>
{
  private readonly logger = new Logger(PaymentCompletedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: PaymentCompletedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling PaymentCompletedEvent for payment ${payload.paymentId}`,
    );

    try {
      // Send payment confirmation email
      // Note: You'll need to fetch user details to get email
      this.logger.log(
        `Payment completed: ${payload.amount} ${payload.currency} - Transaction ID: ${payload.transactionId}`,
      );

      // TODO: Send confirmation email
      // await this.mailService.sendBasicEmail(
      //   userEmail,
      //   'Payment Confirmation',
      //   `Your payment of ${payload.amount} ${payload.currency} has been processed successfully.`
      // );
    } catch (error) {
      this.logger.error(
        `Failed to handle payment completed event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'payment.completed';
  }

  getHandlerName(): string {
    return 'PaymentCompletedHandler';
  }
}

@Injectable()
export class PaymentFailedHandler implements EventHandler<PaymentFailedEvent> {
  private readonly logger = new Logger(PaymentFailedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: PaymentFailedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling PaymentFailedEvent for payment ${payload.paymentId}`,
    );

    try {
      // Send payment failure notification
      this.logger.warn(
        `Payment failed: ${payload.amount} ${payload.currency} - Reason: ${payload.reason}`,
      );

      // TODO: Send failure notification email
      // await this.mailService.sendBasicEmail(
      //   userEmail,
      //   'Payment Failed',
      //   `Your payment of ${payload.amount} ${payload.currency} failed. Reason: ${payload.reason}`
      // );
    } catch (error) {
      this.logger.error(
        `Failed to handle payment failed event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'payment.failed';
  }

  getHandlerName(): string {
    return 'PaymentFailedHandler';
  }
}

@Injectable()
export class PaymentRefundedHandler
  implements EventHandler<PaymentRefundedEvent>
{
  private readonly logger = new Logger(PaymentRefundedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: PaymentRefundedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling PaymentRefundedEvent for payment ${payload.paymentId}`,
    );

    try {
      // Send refund notification
      this.logger.log(
        `Payment refunded: ${payload.amount} ${payload.currency} - Reason: ${payload.refundReason}`,
      );

      // TODO: Send refund notification email
      // await this.mailService.sendBasicEmail(
      //   userEmail,
      //   'Payment Refunded',
      //   `Your payment of ${payload.amount} ${payload.currency} has been refunded. Reason: ${payload.refundReason}`
      // );
    } catch (error) {
      this.logger.error(
        `Failed to handle payment refunded event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'payment.refunded';
  }

  getHandlerName(): string {
    return 'PaymentRefundedHandler';
  }
}
