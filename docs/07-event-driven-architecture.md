# Event-Driven Architecture

This document explains how async events are published, queued, and handled throughout the system.

---

## Architecture Overview

```
Synchronous Request
    ↓
CQRS Handler
    ├─ Modify database
    ├─ Publish domain event
    └─ Return response immediately
    ↓
Client receives response (fast)
    ↓
Meanwhile...
    ↓
Event published to Event Bus (Redis/BullMQ)
    ↓
Multiple async handlers subscribe
    ├─ AuditLogHandler → Create audit log entry
    ├─ NotificationHandler → Send email
    ├─ ComplianceHandler → Check restrictions
    ├─ AnalyticsHandler → Update metrics
    └─ WebSocketHandler → Notify connected clients
    ↓
Handlers process independently (no blocking)
    ↓
If handler fails, message retried automatically
```

## Key Principle

**Don't block the user for side effects.**

If you need to send an email after creating a user, publish an event and handle it async. This keeps response times fast.

---

## Event Publishing (Transactional Outbox)

### Publishing Events

**Location:** `src/common/events/services/event-publisher.service.ts`

**Purpose:** Publish domain events reliably with exactly-once semantics.

### Code Example

```typescript
// In a CQRS Handler
@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler implements ICommandHandler<CreateAdminCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateAdminCommand): Promise<User> {
    const session = await this.userModel.db.startSession();

    const savedUser = await session.withTransaction(async () => {
      // 1. Save to database (within transaction)
      const user = new this.userModel(command.createAdminDto);
      const saved = await user.save({ session });

      // 2. Publish event (also within transaction)
      const event = new AdminUserCreatedEvent({
        userId: saved._id.toString(),
        email: saved.email,
        firstName: saved.firstName,
        position: saved.adminDetails.position,
      });

      await this.eventPublisher.publish(event, session);

      return saved;
    });

    return savedUser;
  }
}
```

### Transactional Outbox Pattern

Why is the transaction important?

```
Without transaction:
  1. Save user: ✓
  2. try { publish event } → ✗ Database down
  3. Result: User exists, but event never fired
               Email never sent, audit log missing

With transaction:
  1. Save user: ✓
  2. Add event to outbox table: ✓
  3. Commit all-or-nothing
  4. Result: Either user + event both exist, or neither exists
```

---

## Domain Events

### Event Class Definition

```typescript
// src/common/events/domain/user-events.ts
export class AdminUserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly position: AdminPosition,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class PaymentVerifiedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly levyId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserVerificationEmailRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly verificationToken: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
```

### Event Naming Convention

- **Past tense**: `UserCreatedEvent` (event already happened)
- **By domain**: `UserXxxEvent`, `PaymentXxxEvent`, `PropertyXxxEvent`
- **Specific action**: `UserEmailVerifiedEvent`, `PaymentRejectedEvent`

---

## Event Handlers

### 1. Email/Notification Handler

**Location:** `src/common/events/handlers/notification.event-handler.ts`

**Purpose:** Send emails and push notifications asynchronously.

**Implementation:**

```typescript
@EventsHandler(
  UserRegisteredEvent,
  UserVerificationEmailRequestedEvent,
  PaymentVerifiedEvent,
  LevyCreatedEvent,
)
export class NotificationEventHandler implements IEventHandler<any> {
  constructor(
    private mailService: MailService,
    @Inject('FIREBASE') private firebaseAdmin: any,
  ) {}

  async handle(event: any) {
    // Route to appropriate handler
    if (event instanceof UserRegisteredEvent) {
      await this.handleUserRegistered(event);
    } else if (event instanceof UserVerificationEmailRequestedEvent) {
      await this.handleVerificationEmail(event);
    } else if (event instanceof PaymentVerifiedEvent) {
      await this.handlePaymentConfirmation(event);
    }
  }

  private async handleUserRegistered(event: UserRegisteredEvent) {
    const { email, firstName, verificationToken } = event;

    // Send verification email
    await this.mailService.sendMail({
      to: email,
      subject: 'Welcome to Estate Manager',
      template: 'welcome',
      context: {
        firstName,
        verificationLink: `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`,
      },
    });

    // Send push notification (if FCM token registered)
    // Can be skipped during registration as user not on app yet
  }

  private async handleVerificationEmail(
    event: UserVerificationEmailRequestedEvent,
  ) {
    const { email, firstName, verificationToken } = event;

    await this.mailService.sendMail({
      to: email,
      subject: 'Verify Your Email',
      template: 'verify-email',
      context: {
        firstName,
        otp: verificationToken, // 6-digit code
      },
    });
  }

  private async handlePaymentConfirmation(event: PaymentVerifiedEvent) {
    const { userId, amount } = event;

    // Find user and get email
    const user = await this.userService.findOne(userId);

    // Send confirmation email
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Payment Confirmed',
      template: 'payment-confirmed',
      context: {
        firstName: user.firstName,
        amount,
        date: new Date().toLocaleDateString(),
      },
    });

    // Send push notification
    if (user.fcmTokens?.length) {
      for (const fcmToken of user.fcmTokens) {
        try {
          await this.firebaseAdmin.messaging().send({
            token: fcmToken,
            notification: {
              title: 'Payment Confirmed',
              body: `₦${amount} payment received and verified`,
            },
            data: {
              type: 'payment_confirmed',
              paymentId: event.paymentId,
            },
          });
        } catch (err) {
          // FCM token may be invalid, user uninstalled app
          // In production, remove token from DB
        }
      }
    }
  }
}
```

### 2. Audit Logging Handler

**Location:** `src/audit-logs/audit-logs.event-handler.ts`

**Purpose:** Record every action in audit trail.

**Implementation:**

```typescript
@EventsHandler(
  AdminUserCreatedEvent,
  PaymentVerifiedEvent,
  UserEmailVerifiedEvent,
  LevyCreatedEvent,
)
export class AuditLogsEventHandler implements IEventHandler<any> {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async handle(event: any) {
    try {
      let auditEntry: Partial<AuditLog>;

      if (event instanceof AdminUserCreatedEvent) {
        auditEntry = {
          action: 'create',
          entityType: 'user',
          entityId: event.userId,
          changes: {
            email: event.email,
            firstName: event.firstName,
            position: event.position,
          },
          timestamp: event.timestamp,
        };
      } else if (event instanceof PaymentVerifiedEvent) {
        auditEntry = {
          action: 'verify',
          entityType: 'payment',
          entityId: event.paymentId,
          relatedEntityId: event.levyId,
          changes: {
            status: 'verified',
            verifiedAmount: event.amount,
          },
          timestamp: event.timestamp,
        };
      }
      // ... more event types ...

      await this.auditLogModel.create(auditEntry);
    } catch (error) {
      // Never let audit logging failure break the system
      logger.error('Audit log creation failed', error);
    }
  }
}
```

### 3. Compliance Handler

**Location:** `src/compliance/compliance.event-handler.ts`

**Purpose:** Enforce automated compliance rules (e.g., restrict services if levy unpaid).

**Implementation:**

```typescript
@EventsHandler(PaymentVerifiedEvent)
export class ComplianceEventHandler
  implements IEventHandler<PaymentVerifiedEvent>
{
  constructor(
    private usersService: UsersService,
    private leviesService: LeviesService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async handle(event: PaymentVerifiedEvent) {
    const { userId, levyId } = event;

    try {
      // Check if user now has all levies paid
      const user = await this.usersService.findOne(userId);
      const allLevies = await this.leviesService.findByEstate(user.estateId);

      const allPaid = allLevies.every(
        (levy) => levy.amountPaid >= levy.totalAmount,
      );

      if (allPaid) {
        // Enable gate pass generation
        await this.userModel.findByIdAndUpdate(userId, {
          canGenerateTokens: true,
        });

        // Publish event for notification
        await this.eventPublisher.publish(new ComplianceRestoredEvent(userId));
      } else {
        // Still owes money
        await this.userModel.findByIdAndUpdate(userId, {
          canGenerateTokens: false,
        });
      }
    } catch (error) {
      logger.error('Compliance check failed', error);
      // Don't fail the request, but log for investigation
    }
  }
}
```

### 4. WebSocket/Real-time Handler

**Location:** `src/events/events.listener.ts`

**Purpose:** Notify connected users in real-time via WebSocket.

**Implementation:**

```typescript
@EventsHandler(PaymentVerifiedEvent, LevyCreatedEvent, AdminUserCreatedEvent)
export class RealTimeEventHandler implements IEventHandler<any> {
  constructor(private readonly eventsGateway: EventsGateway) {}

  async handle(event: any) {
    if (event instanceof PaymentVerifiedEvent) {
      // Notify tenant: payment confirmed
      this.eventsGateway.notifyUser(event.userId, {
        type: 'payment_verified',
        data: {
          paymentId: event.paymentId,
          amount: event.amount,
        },
      });

      // Notify admins: payment verified
      this.eventsGateway.notifyRole(UserRole.ADMIN, {
        type: 'payment_verified_admin',
        data: event,
      });
    } else if (event instanceof LevyCreatedEvent) {
      // Notify all estate residents
      this.eventsGateway.notifyEstate(event.estateId, {
        type: 'new_levy',
        data: {
          levyName: event.name,
          amount: event.totalAmount,
          dueDate: event.dueDate,
        },
      });
    }
  }
}
```

---

## Event Publisher Infrastructure

### BullMQ Job Queue

Events are stored in Redis BullMQ queues:

```typescript
// src/common/events/services/event-publisher.service.ts
export class EventPublisher {
  constructor(
    @Inject('EVENT_QUEUE') private eventQueue: Queue,
  ) {}

  async publish(event: any, session?: ClientSession) {
    // 1. Store event in database (Transactional Outbox)
    await this.storeEventInOutbox(event, session);

    // 2. Queue job in Redis for processing
    await this.eventQueue.add(
      'process-event',
      { event, timestamp: new Date() },
      {
        attempts: 5,              // Retry 5 times on failure
        backoff: {
          type: 'exponential',
          delay: 2000,            // Start with 2 seconds
        },
        removeOnComplete: true,   // Remove after success
        removeOnFail: the false,   // Keep failed jobs for debugging
      },
    );
  }

  private async storeEventInOutbox(event: any, session?: ClientSession) {
    // Store in special "outbox" collection for exactly-once delivery
    await this.outboxModel.create([{
      eventType: event.constructor.name,
      eventData: event,
      processed: false,
      timestamp: new Date(),
    }], { session });
  }
}
```

### Worker Processing

```typescript
// Queue worker processes events
const worker = new Worker('event-queue', async (job) => {
  const { event } = job.data;

  // Routes to appropriate handler based on event type
  const handlers = moduleRef.get<IEventHandler<any>[]>(EVENT_HANDLERS);

  for (const handler of handlers) {
    await handler.handle(event);
  }
});

worker.on('completed', (job) => {
  // Mark as processed in outbox
  outboxModel.updateOne({ _id: job.data.id }, { processed: true });
});

worker.on('failed', (job, err) => {
  logger.error(`Event processing failed: ${err.message}`);
  // Retry automatically (configured via queue options)
});
```

---

## Event Flow Examples

### Payment Verification Flow

```
1. Admin clicks "Verify Payment"
    ↓
[PATCH /payments/:id/verify]
    ↓
VerifyPaymentHandler
    ├─ Start transaction
    ├─ Update Payment (status=verified)
    ├─ Update Levy (amountPaid+=)
    ├─ Create PaymentVerifiedEvent
    ├─ Publish event to EventPublisher
    │   └─ Store in outbox table
    │   └─ Queue in Redis BullMQ
    ├─ Commit transaction
    └─ Return response immediately → Client (fast!)

    [Response sent in ~200ms]

2. Meanwhile, async handlers process event:

    ComplianceHandler
    ├─ Find user
    ├─ Check if all levies paid
    ├─ If yes: Enable gate pass generation
    ├─ Publish ComplianceRestoredEvent

    NotificationHandler
    ├─ Find user
    ├─ Send payment confirmation email
    ├─ Send push notification

    AuditLogsHandler
    ├─ Create audit log entry

    RealTimeHandler
    ├─ Notify user via WebSocket
    ├─ Notify admins via WebSocket

    [All async, happens in background]
```

### User Registration Flow

```
1. Client registers
    ↓
[POST /auth/register] RegisterRequestDto
    ↓
RegisterHandler
    ├─ Hash password
    ├─ Create User in DB
    ├─ Publish UserRegisteredEvent
    └─ Return response

    [Response sent: "Check your email" (~150ms)]

2. Async handlers:

    NotificationHandler
    └─ Send verification email (Nodemailer)
       Subject: "Welcome to Estate Manager"
       Body: "Click link to verify"
       ✓ Sent within seconds

    AuditLogsHandler
    └─ Log user creation

    RealTimeHandler
    └─ Might notify super_admin dashboard
```

---

## Monitoring & Debugging

### BullBoard Dashboard

Access at `http://localhost:3000/admin/queues` to monitor events:

```
Event Queue
├── Completed: 24,531 events
├── Failed: 3 events
├── Pending: 12 events (waiting for retry)
├── Active: 2 events (currently processing)
└── Delayed: 5 events (will retry soon)

Most Recent:
- ✓ PaymentVerifiedEvent (2ms)
- ✓ AdminUserCreatedEvent (15ms)
- ✗ NotificationEventHandler failed (retry at 14:30)
```

### Checking Outbox for Orphaned Events

```typescript
// Find events that failed and weren't processed
db.outbox.find({
  processed: false,
  timestamp: { $lt: new Date(Date.now() - 5 * 60 * 1000) },
});

// If found, manually reprocess:
db.outbox.updateMany({ _id: { $in: [ids] } }, { $set: { processed: false } });
// Then restart worker
```

---

## Best Practices

✅ **DO:**

- Publish events for all side effects (emails, compliance, notifications)
- Make handlers idempotent (safe to retry)
- Keep handlers focused on single responsibility
- Log failures for debugging
- Use transactions for atomic writes + event publishing

❌ **DON'T:**

- Block user request for event processing
- Publish same event twice (transaction ensures once)
- Forget error handling in handlers
- Log sensitive data in events
- Make handlers dependent on each other (race conditions)

---

## Event Retention & Cleanup

Processed events with old timestamps should be archived or deleted to save space:

```typescript
// Scheduled job (runs daily)
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async archiveOldEvents() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await this.outboxModel.deleteMany({
    processed: true,
    timestamp: { $lt: thirtyDaysAgo },
  });
}
```

---

**Next:** See [08-database-models.md](08-database-models.md) for MongoDB schema documentation.
