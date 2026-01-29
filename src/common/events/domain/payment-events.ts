// src/common/events/domain/payment-events.ts
import { BaseDomainEvent, DomainEventMetadata } from './base-domain-event';

export interface PaymentInitiatedPayload {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string;
  metadata?: Record<string, any>;
}

export class PaymentInitiatedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: PaymentInitiatedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('payment.initiated', data.paymentId, 'Payment', metadata);
  }

  getPayload(): PaymentInitiatedPayload {
    return this.data;
  }
}

export interface PaymentCompletedPayload {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  reference: string;
  transactionId: string;
  completedAt: Date;
  metadata?: Record<string, any>;
}

export class PaymentCompletedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: PaymentCompletedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('payment.completed', data.paymentId, 'Payment', metadata);
  }

  getPayload(): PaymentCompletedPayload {
    return this.data;
  }
}

export interface PaymentFailedPayload {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  reference: string;
  reason: string;
  failedAt: Date;
  metadata?: Record<string, any>;
}

export class PaymentFailedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: PaymentFailedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('payment.failed', data.paymentId, 'Payment', metadata);
  }

  getPayload(): PaymentFailedPayload {
    return this.data;
  }
}

export interface PaymentRefundedPayload {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  reference: string;
  refundReason: string;
  refundedAt: Date;
  metadata?: Record<string, any>;
}

export class PaymentRefundedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: PaymentRefundedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('payment.refunded', data.paymentId, 'Payment', metadata);
  }

  getPayload(): PaymentRefundedPayload {
    return this.data;
  }
}
