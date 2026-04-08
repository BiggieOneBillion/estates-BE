# CQRS Pattern Implementation

This document explains how the Command Query Responsibility Segregation (CQRS) pattern is implemented across the codebase.

## What is CQRS?

CQRS separates **write operations** (Commands) from **read operations** (Queries):

- **Commands**: Modify state (Create, Update, Delete)
- **Queries**: Fetch data without side effects (Read)

```
User Request
    ↓
Controller
    ├─ If Modify: Send to Command Bus
    │   └─ Command Handler executes, returns result
    │
    └─ If Read: Send to Query Bus
        └─ Query Handler executes, returns data
```

## Benefits

✅ **Separation of Concerns**: Read and write logic are independent  
✅ **Scalability**: Can optimize reads and writes separately  
✅ **Auditability**: Every state change goes through a command  
✅ **Testability**: Individual handlers are easy to unit test  
✅ **Event Sourcing**: Natural fit for event-driven architecture

---

## Implementation Structure

### File Organization

```
src/<module>/cqrs/
├── commands/
│   ├── impl/
│   │   ├── create-user.command.ts        # Command class
│   │   ├── update-user.command.ts
│   │   └── delete-user.command.ts
│   └── handlers/
│       ├── create-user.handler.ts        # Command Handler
│       ├── update-user.handler.ts
│       └── delete-user.handler.ts
└── queries/
    ├── impl/
    │   ├── find-user-by-id.query.ts      # Query class
    │   ├── find-all-users.query.ts
    │   └── find-users-by-estate.query.ts
    └── handlers/
        ├── find-user-by-id.handler.ts    # Query Handler
        ├── find-all-users.handler.ts
        └── find-users-by-estate.handler.ts
```

---

## Commands

### Command Class Example

```typescript
// src/users/cqrs/commands/impl/create-user.command.ts
import { ICommand } from '@nestjs/cqrs';
import { CreateUserRequestDto } from '../../dto/request/create-user.request.dto';

export class CreateUserCommand implements ICommand {
  constructor(
    readonly createUserDto: CreateUserRequestDto,
    readonly createdBy: string, // Which admin created
  ) {}
}
```

### Command Handler Example

```typescript
// src/users/cqrs/commands/handlers/create-user.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../entities/user.entity';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { BadRequestException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    this.logger.log(`Creating user: ${command.createUserDto.email}`);

    const { createUserDto, createdBy } = command;

    // 1. Validate unique email
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 3. Create user document in database
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      createdBy,
      isEmailVerified: false,
      tokenVersion: 0,
    });

    // 4. Save with transaction
    const session = await this.userModel.db.startSession();
    const savedUser = await session.withTransaction(async () => {
      const result = await user.save({ session });

      // 5. Publish domain event (async handlers will process)
      const event = new UserCreatedEvent({
        userId: result._id.toString(),
        email: result.email,
        firstName: result.firstName,
        primaryRole: result.primaryRole,
      });

      await this.eventPublisher.publish(event, session);

      return result;
    });

    this.logger.log(`User created successfully: ${savedUser._id}`);
    return savedUser;
  }
}
```

### Handler Registration

```typescript
// src/users/users.module.ts
import { CqrsModule } from '@nestjs/cqrs';

const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  // ... more handlers
];

const QueryHandlers = [
  FindUserByIdHandler,
  FindAllUsersHandler,
  // ... more handlers
];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class UsersModule {}
```

### Dispatching Commands

```typescript
// In Controller
@Post('create/admin')
async createAdmin(
  @Body() createAdminDto: CreateAdminRequestDto,
  @CurrentUser() currentUser: any,
): Promise<UserResponseDto> {
  return this.commandBus.execute(
    new CreateAdminCommand(createAdminDto, currentUser.sub),
  );
}
```

---

## Queries

### Query Class Example

```typescript
// src/users/cqrs/queries/impl/find-user-by-id.query.ts
import { IQuery } from '@nestjs/cqrs';

export class FindUserByIdQuery implements IQuery {
  constructor(readonly userId: string) {}
}
```

### Query Handler Example

```typescript
// src/users/cqrs/queries/handlers/find-user-by-id.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserByIdQuery } from '../impl/find-user-by-id.query';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../entities/user.entity';
import { NotFoundException, Logger } from '@nestjs/common';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
  private readonly logger = new Logger(FindUserByIdHandler.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async execute(query: FindUserByIdQuery): Promise<User> {
    this.logger.log(`Fetching user: ${query.userId}`);

    const user = await this.userModel
      .findById(query.userId)
      .select('-password') // Exclude sensitive fields
      .lean(); // Return plain object (faster)

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
```

### Dispatching Queries

```typescript
// In Controller
@Get(':id')
async getUser(@Param('id') userId: string): Promise<UserResponseDto> {
  return this.queryBus.execute(new FindUserByIdQuery(userId));
}
```

---

## Key Patterns in This Codebase

### 1. **Database Transactions in Handlers**

Ensures atomicity - all changes succeed or all fail:

```typescript
const session = await this.userModel.db.startSession();
const result = await session.withTransaction(async () => {
  // All operations here are atomic
  await this.userModel.updateOne(..., { session });
  await this.propertyModel.updateOne(..., { session });
  await this.eventPublisher.publish(event, session);
  return result;
});
```

### 2. **Event Publishing After State Change**

Commands publish events for async processing:

```typescript
// Inside command handler
const event = new PaymentVerifiedEvent({...});
await this.eventPublisher.publish(event, session);

// Later, async event handlers:
@EventsHandler(PaymentVerifiedEvent)
export class PaymentVerifiedEventHandler {
  async handle(event: PaymentVerifiedEvent) {
    // Send notification email
    // Update compliance status
    // Create audit log
  }
}
```

### 3. **Soft Deletes**

Handlers mark records as deleted instead of removing:

```typescript
// In handler
await this.userModel.findByIdAndUpdate(userId, {
  deletedAt: new Date(),
});

// Queries automatically exclude soft-deleted
const users = await this.userModel.find({ deletedAt: { $exists: false } });
```

### 4. **Request-Response DTOs**

Separate classes for input validation and output serialization:

```typescript
// Request DTO (validated by ValidationPipe)
export class CreateUserRequestDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  primaryRole: UserRole;
}

// Response DTO (excludes sensitive fields)
export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  primaryRole: UserRole;
  // passwords, tokens, tokens never included
}

// In handler
const savedUser = await user.save();
return this.mapToResponseDto(savedUser); // Hide sensitive data
```

---

## Real-World Example: Payment Verification

### Flow

```
Admin clicks "Verify Payment"
    ↓
[PATCH /payments/:id/verify] (req body)
    ↓
PaymentsController.verify()
    ├─ Extract payload
    └─ commandBus.execute(new VerifyPaymentCommand(...))
    ↓
VerifyPaymentHandler.execute()
    ├─ Database transaction starts
    ├─ Update Payment record (status = verified)
    ├─ Update Levy record (amountPaid + amount)
    ├─ Publish PaymentVerifiedEvent
    ├─ Transaction commits
    └─ Return updated Payment
    ↓
Multiple async event handlers triggered:
    ├─ ComplianceCheckHandler
    │   ├─ Check if all levies paid
    │   └─ Enable gate pass generation if paid
    │
    ├─ AuditLogHandler
    │   └─ Log the verification action
    │
    └─ NotificationHandler
        ├─ Send payment confirmation email
        └─ Send push notification
    ↓
Client receives: { success: true, data: payment }
```

### Code

```typescript
// Command
export class VerifyPaymentCommand implements ICommand {
  constructor(
    readonly paymentId: string,
    readonly verifiedAmount: number,
    readonly adminId: string,
  ) {}
}

// Handler
@CommandHandler(VerifyPaymentCommand)
export class VerifyPaymentHandler
  implements ICommandHandler<VerifyPaymentCommand>
{
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Levy.name) private levyModel: Model<Levy>,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(command: VerifyPaymentCommand): Promise<Payment> {
    const { paymentId, verifiedAmount, adminId } = command;

    const payment = await this.paymentModel.findById(paymentId);
    if (!payment || payment.status !== 'pending') {
      throw new BadRequestException('Payment cannot be verified');
    }

    const session = await this.paymentModel.db.startSession();
    const verifiedPayment = await session.withTransaction(async () => {
      // Update payment
      payment.status = 'verified';
      payment.verifiedAmount = verifiedAmount;
      payment.verifiedBy = adminId;
      payment.verifiedAt = new Date();
      await payment.save({ session });

      // Update levy
      const levy = await this.levyModel.findById(payment.levyId);
      levy.amountPaid += verifiedAmount;
      levy.isPaid = levy.amountPaid >= levy.totalAmount;
      await levy.save({ session });

      // Publish event
      const event = new PaymentVerifiedEvent({
        paymentId: payment._id,
        userId: payment.userId,
        levyId: payment.levyId,
        amount: verifiedAmount,
      });
      await this.eventPublisher.publish(event, session);

      return payment;
    });

    return verifiedPayment;
  }
}

// Event Handlers (async)
@EventsHandler(PaymentVerifiedEvent)
export class PaymentVerifiedComplianceHandler {
  constructor(private usersService: UsersService) {}

  async handle(event: PaymentVerifiedEvent) {
    const user = await this.usersService.findOne(event.userId);
    const allLeviesPaid = await this.checkAllLeviesPaid(user.estateId);

    if (allLeviesPaid) {
      await this.usersService.enableTokenGeneration(event.userId);
    }
  }
}

@EventsHandler(PaymentVerifiedEvent)
export class PaymentVerifiedAuditHandler {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async handle(event: PaymentVerifiedEvent) {
    await this.auditLogModel.create({
      action: 'verify_payment',
      entityType: 'payment',
      entityId: event.paymentId,
      timestamp: new Date(),
      details: { amount: event.amount },
    });
  }
}
```

---

## Testing CQRS Handlers

### Unit Test Example

```typescript
describe('VerifyPaymentHandler', () => {
  let handler: VerifyPaymentHandler;
  let paymentModel: Model<Payment>;
  let levyModel: Model<Levy>;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    // Initialize mocks
    paymentModel = { ...mockPaymentModel };
    eventPublisher = { publish: jest.fn() };

    handler = new VerifyPaymentHandler(
      paymentModel,
      levyModel,
      eventPublisher,
    );
  });

  it('should verify payment and publish event', async () => {
    const command = new VerifyPaymentCommand(
      'payment_123',
      50000,
      'admin_456',
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('verified');
    expect(eventPublisher.publish).toHaveBeenCalled();
  });

  it('should throw error if payment not pending', async () => {
    // Setup: payment already verified
    paymentModel.findById.mockResolvedValue({
      status: 'verified',
    });

    const command = new VerifyPaymentCommand(...);

    await expect(handler.execute(command)).rejects.toThrow(
      BadRequestException,
    );
  });
});
```

---

## Best Practices

✅ **DO:**

- Keep handlers focused on single responsibility
- Use transactions for multi-entity changes
- Publish events for side effects
- Keep commands simple (just data containers)
- Use DTOs for request/response

❌ **DON'T:**

- Do direct HTTP calls in handlers (use services)
- Skip database transactions
- Forget to publish events
- Catch and swallow exceptions silently
- Use `any` type in command/query definitions

---

## Common Commands in Codebase

| Command                 | Purpose                 | File                                 |
| ----------------------- | ----------------------- | ------------------------------------ |
| `LoginCommand`          | Authenticate user       | `src/auth/cqrs/commands/impl/`       |
| `RegisterCommand`       | Create new user account | `src/auth/cqrs/commands/impl/`       |
| `CreateAdminCommand`    | Create admin user       | `src/users/cqrs/commands/impl/`      |
| `CreatePropertyCommand` | Register new property   | `src/properties/cqrs/commands/impl/` |
| `CreatePaymentCommand`  | Record payment          | `src/payments/cqrs/commands/impl/`   |
| `VerifyPaymentCommand`  | Approve payment         | `src/payments/cqrs/commands/impl/`   |
| `CreateLevyCommand`     | Create new assessment   | `src/levies/cqrs/commands/impl/`     |

---

## Common Queries in Codebase

| Query                      | Purpose                | File                                |
| -------------------------- | ---------------------- | ----------------------------------- |
| `FindUserByIdQuery`        | Get user details       | `src/users/cqrs/queries/impl/`      |
| `FindAllPropertiesQuery`   | List properties        | `src/properties/cqrs/queries/impl/` |
| `FindPaymentsByUserQuery`  | User's payment history | `src/payments/cqrs/queries/impl/`   |
| `FindPendingPaymentsQuery` | Admin's pending list   | `src/payments/cqrs/queries/impl/`   |
| `FindLeviesByEstateQuery`  | Estate's assessments   | `src/levies/cqrs/queries/impl/`     |

---

For more on event-driven architecture, see [07-event-driven-architecture.md](07-event-driven-architecture.md).
