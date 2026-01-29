// src/common/events/domain/levy-events.ts
import { BaseDomainEvent, DomainEventMetadata } from './base-domain-event';

export interface LevyCreatedPayload {
  levyId: string;
  estateId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

export class LevyCreatedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: LevyCreatedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('levy.created', data.levyId, 'Levy', metadata);
  }

  getPayload(): LevyCreatedPayload {
    return this.data;
  }
}

export interface LevyDueReminderPayload {
  levyId: string;
  estateId: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  amount: number;
  dueDate: Date;
  daysUntilDue: number;
  metadata?: Record<string, any>;
}

export class LevyDueReminderEvent extends BaseDomainEvent {
  constructor(
    private readonly data: LevyDueReminderPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('levy.due_reminder', data.levyId, 'Levy', metadata);
  }

  getPayload(): LevyDueReminderPayload {
    return this.data;
  }
}

export interface LevyOverduePayload {
  levyId: string;
  estateId: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  amount: number;
  dueDate: Date;
  daysOverdue: number;
  metadata?: Record<string, any>;
}

export class LevyOverdueEvent extends BaseDomainEvent {
  constructor(
    private readonly data: LevyOverduePayload,
    metadata?: DomainEventMetadata,
  ) {
    super('levy.overdue', data.levyId, 'Levy', metadata);
  }

  getPayload(): LevyOverduePayload {
    return this.data;
  }
}

export interface LevyPaidPayload {
  levyId: string;
  estateId: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  amount: number;
  paymentId: string;
  paidAt: Date;
  metadata?: Record<string, any>;
}

export class LevyPaidEvent extends BaseDomainEvent {
  constructor(
    private readonly data: LevyPaidPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('levy.paid', data.levyId, 'Levy', metadata);
  }

  getPayload(): LevyPaidPayload {
    return this.data;
  }
}
