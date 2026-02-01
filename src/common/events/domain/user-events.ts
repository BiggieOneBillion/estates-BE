// src/common/events/domain/user-events.ts
import { BaseDomainEvent, DomainEventMetadata } from './base-domain-event';

export interface UserCreatedPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verificationToken: string;
}

export class UserCreatedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: UserCreatedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('user.created', data.userId, 'User', metadata);
  }

  getPayload(): UserCreatedPayload {
    return this.data;
  }
}

export interface UserVerifiedPayload {
  userId: string;
  email: string;
  verifiedAt: Date;
}

export class UserVerifiedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: UserVerifiedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('user.verified', data.userId, 'User', metadata);
  }

  getPayload(): UserVerifiedPayload {
    return this.data;
  }
}

export interface UserLoggedInPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  verificationToken: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export class UserLoggedInEvent extends BaseDomainEvent {
  constructor(
    private readonly data: UserLoggedInPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('user.logged_in', data.userId, 'User', metadata);
  }

  getPayload(): UserLoggedInPayload {
    return this.data;
  }
}

export interface UserPasswordResetRequestedPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  resetToken: string;
}

export class UserPasswordResetRequestedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: UserPasswordResetRequestedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('user.password_reset_requested', data.userId, 'User', metadata);
  }

  getPayload(): UserPasswordResetRequestedPayload {
    return this.data;
  }
}

export interface UserPasswordResetCompletedPayload {
  userId: string;
  email: string;
  resetAt: Date;
}

export class UserPasswordResetCompletedEvent extends BaseDomainEvent {
  constructor(
    private readonly data: UserPasswordResetCompletedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super('user.password_reset_completed', data.userId, 'User', metadata);
  }

  getPayload(): UserPasswordResetCompletedPayload {
    return this.data;
  }
}
