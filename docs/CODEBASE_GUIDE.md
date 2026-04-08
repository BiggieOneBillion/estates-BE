# Estate Management System - Comprehensive Codebase Guide

**Last Updated:** February 2026  
**Author:** Code Analysis Documentation  
**Status:** Complete Overview for Onboarding

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Request-to-Response Lifecycle](#request-to-response-lifecycle)
3. [Core Modules Deep Dive](#core-modules-deep-dive)
4. [CQRS Pattern Implementation](#cqrs-pattern-implementation)
5. [Cross-Cutting Concerns](#cross-cutting-concerns)
6. [Event-Driven Architecture](#event-driven-architecture)
7. [Database Models](#database-models)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Common Patterns & Best Practices](#common-patterns--best-practices)
10. [Troubleshooting & Tips](#troubleshooting--tips)

---

## Project Overview

### What is This?

A **NestJS-based Estate Management System** designed for managing residential communities with advanced role-based access control, financial operations, and real-time notifications.

### Technology Stack

| Component                   | Technology                     | Purpose                                                |
| --------------------------- | ------------------------------ | ------------------------------------------------------ |
| **Backend Framework**       | NestJS 11.0 + Node.js          | HTTP server, REST API, real-time WebSocket             |
| **Primary Database**        | MongoDB (Mongoose ODM)         | Document storage for users, properties, payments, etc. |
| **Cache & Job Queue**       | Redis + BullMQ                 | Transient data, asynchronous job processing            |
| **Real-time Communication** | Socket.io (with Redis adapter) | WebSocket for notifications and live updates           |
| **Authentication**          | Passport.js + JWT              | Stateless auth, JWT token-based identity               |
| **API Documentation**       | Swagger/OpenAPI                | Auto-generated API documentation                       |
| **File Management**         | Cloudinary                     | Cloud-based image/document storage                     |
| **Payment Gateway**         | Paystack                       | Online payment processing                              |
| **Email Service**           | Nodemailer                     | Transactional emails (verification, notifications)     |
| **Push Notifications**      | Firebase Cloud Messaging       | Mobile push notifications                              |
| **Observability**           | OpenTelemetry + Jaeger         | Distributed tracing for debugging                      |
| **Task Scheduling**         | Bull Board + @nestjs/schedule  | Scheduled jobs and queue monitoring                    |

### Key Features

- **Role-Based Access Control (RBAC)**: 6 user roles (Super Admin, Site Admin, Admin, Landlord, Tenant, Security) with granular permissions
- **Automated Compliance**: Gate pass generation blocked if levies unpaid
- **Financial Management**: Manual & online (Paystack) payments with reconciliation
- **Audit Logging**: Every action tracked with event sourcing
- **Real-time Notifications**: WebSocket-based alerts for tenants & security
- **Media Management**: Cloud-native uploads via Cloudinary
- **Visitor Management**: Temporary gate pass tokens for controlled access

### Folder Structure

```
src/
├── auth/                    # Authentication (login, register, JWT)
├── users/                   # User management (CRUD, roles, permissions)
├── properties/              # Property registry and management
├── estates/                 # Estate (community) management
├── payments/                # Payment processing & reconciliation
├── levies/                  # Assessment/fee management
├── notifications/           # Email & push notification system
├── gatePassToken/           # Visitor management (gate passes)
├── compliance/              # Automated leverage checks
├── cloudinary/              # Media upload/storage service
├── events/                  # WebSocket/Socket.io gateway
├── audit-logs/              # Audit trail system
├── common/                  # Shared utilities, middleware, filters, guards
│   ├── adapters/           # Redis adapter for WebSocket
│   ├── database/           # Database plugins (soft delete)
│   ├── decorators/         # Custom decorators (@CurrentUser, etc.)
│   ├── dto/                # Shared data transfer objects
│   ├── enums/              # Global enums
│   ├── events/             # Event infrastructure & event publishers
│   ├── exceptions/         # Custom exception classes
│   ├── filters/            # Global exception filters
│   ├── guards/             # Auth guards (JWT, Roles, Permissions)
│   ├── interceptors/       # Global interceptors (audit, logging)
│   ├── interfaces/         # TypeScript interfaces
│   ├── middleware/         # Request logging middleware
│   ├── seeders/            # Database seeders
│   ├── services/           # Shared services (Mail, Logger)
│   └── utils/              # Helper functions
├── config/                 # Configuration management
├── main.ts                 # Application bootstrap
└── app.module.ts          # Root module
```

---

## Request-to-Response Lifecycle

### Step-by-Step Flow

```
1. HTTP Request Arrives
        ↓
2. CORS Middleware (app.enableCors)
        ↓
3. Logger Middleware (logs method, URL, body)
        ↓
4. Global Validation Pipe (ValidationPipe)
        ↓
5. Route Handler (Controller)
        ↓
6. Authentication Guard (JwtAuthGuard)
        ↓
7. Role/Permission Guards (RolesGuard, PermissionsGuard)
        ↓
8. Command/Query Execution (CQRS Bus)
        ↓
9. Business Logic (Handler, Service, Database)
        ↓
10. Event Publishing (Transactional Outbox)
        ↓
11. Response Transformation (Success/Error)
        ↓
12. Error Filter (HttpExceptionFilter, AllExceptionsFilter)
        ↓
13. HTTP Response Sent
        ↓
14. Audit Interceptor (logs to audit collection)
```

### Key Components in the Flow

#### 1. **Bootstrap (main.ts)**

- Initializes NestFactory and creates app instance
- Sets up Redis adapter for WebSockets
- Configures global middleware and filters
- Enables Swagger documentation

```typescript
// From: src/main.ts
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);

app.useGlobalPipes(new ValidationPipe({ ... }));
app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());
```

#### 2. **Request Entry Point (Logger Middleware)**

- Captures incoming request metadata (method, URL, headers, body)
- Records processing duration
- Logs response status

```typescript
// From: src/common/middleware/logger.middleware.ts
logger.info(`REQUEST STARTED ➡️ [${method}] ${originalUrl}`);
logger.info(`Body: ${JSON.stringify(body)}`);
// ... processing ...
logger.info(
  `RESPONSE ⬅️ [${method}] ${originalUrl} ${statusCode} - ${duration}ms`,
);
```

#### 3. **Controller Entry Point**

- Receives request and extracts parameters
- Executes guards (Auth, Roles, Permissions)
- Dispatches commands or queries

```typescript
@Post('login')
async login(@Body() loginDto: LoginRequestDto) {
  return this.commandBus.execute(new LoginCommand(loginDto, isMobile));
}
```

#### 4. **Guard Execution (Sequential)**

- **JwtAuthGuard**: Validates JWT token, extracts user info
- **RolesGuard**: Checks if user's role matches required roles
- **PermissionsGuard**: Checks granular resource permissions
- **VerifiedGuard**: Ensures email/identity is verified

#### 5. **CQRS Command/Query Handler**

- Executes business logic
- Performs database operations
- Publishes domain events

```typescript
// From: src/auth/cqrs/commands/handlers/login.handler.ts
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  async execute(command: LoginCommand): Promise<any> {
    // 1. Find user
    const user = await this.usersService.findByEmail(email);

    // 2. Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 3. Generate JWT
    const payload: JwtPayload = { sub: user._id, email: user.email, ... };
    const token = this.jwtService.sign(payload);

    // 4. Publish event (for audit, notifications, etc.)
    await this.eventPublisher.publish(new UserLoggedInEvent(...));

    return { access_token: token, user: ... };
  }
}
```

#### 6. **Database Interaction (Mongoose)**

- Commands modify data (create, update, delete)
- Queries fetch data (read-only)
- Soft delete plugin prevents hard deletes

#### 7. **Event Publishing (Transactional Outbox)**

- Events wrapped in database transaction
- Ensures consistency even if async processing fails
- Events queued for async handlers

#### 8. **Error Handling (Exception Filters)**

- Catches all exceptions (HTTP and unexpected)
- Normalizes error message to safe response
- Logs full error internally
- Returns structured error to client

```typescript
// From: src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const publicError = normalizeError(errorType, message);

    response.status(publicError.statusCode).json({
      success: false,
      error: { statusCode, type, message, details },
      requestId,
      timestamp,
      path,
    });
  }
}
```

### Response Structure

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "requestId": "req-123",
  "timestamp": "2026-02-10T10:30:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "requestId": "req-123",
  "error": {
    "statusCode": 400,
    "type": "BAD_REQUEST",
    "message": "Invalid credentials",
    "details": ["password is required"]
  },
  "timestamp": "2026-02-10T10:30:00Z",
  "path": "/auth/login",
  "method": "POST"
}
```

---

## Core Modules Deep Dive

See [03-core-modules.md](03-core-modules.md) for detailed module analysis.

---

## CQRS Pattern Implementation

See [05-cqrs-pattern.md](05-cqrs-pattern.md) for CQRS details.

---

## Cross-Cutting Concerns

See [06-cross-cutting-concerns.md](06-cross-cutting-concerns.md) for middleware, guards, and interceptors.

---

## Event-Driven Architecture

See [07-event-driven-architecture.md](07-event-driven-architecture.md) for event handling.

---

## Database Models

See [08-database-models.md](08-database-models.md) for MongoDB schemas.

---

## API Endpoints Reference

See [04-endpoints-reference.md](04-endpoints-reference.md) for complete endpoint list.

---

## Common Patterns & Best Practices

### 1. **Creating a New Module**

```bash
nest g module features/new-feature
nest g controller features/new-feature
nest g service features/new-feature
```

Then:

1. Create CQRS commands/queries in `cqrs/` folder
2. Create handlers in `cqrs/commands/handlers/` and `cqrs/queries/handlers/`
3. Define DTOs in `dto/` folder
4. Define entities/schemas in `entities/` folder
5. Add to `app.module.ts` imports

### 2. **Handling Database Transactions**

```typescript
const session = await this.userModel.db.startSession();
await session.withTransaction(async () => {
  // All database operations here are atomic
  const user = await this.userModel.findByIdAndUpdate(id, data, { session });
  await this.eventPublisher.publish(event, session);
});
```

### 3. **Publishing Domain Events**

```typescript
const event = new UserUpdatedEvent({
  userId: user._id,
  changes: { email, phone },
});
await this.eventPublisher.publish(event);
// Async handlers will process this event
```

### 4. **Validating Input with DTOs**

```typescript
// Create dedicated request/response DTOs
export class CreateUserRequestDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  primaryRole: UserRole;
}

// ValidationPipe automatically validates and transforms
@Post()
async create(@Body() dto: CreateUserRequestDto) { ... }
```

### 5. **Checking Permissions**

```typescript
@UseGuards(PermissionsGuard)
@RequirePermission(ResourceType.PROPERTIES, PermissionAction.CREATE)
@Post()
create(@Body() dto: CreatePropertyDto) { ... }
```

---

## Troubleshooting & Tips

### Issue: JWT Token Expired or Invalid

**Check:**

1. JWT_SECRET in `.env` matches in both encryption and decryption
2. Token expiration time (`expiresIn: '365d'` in auth.module.ts)
3. User's `tokenVersion` hasn't been incremented (invalidates all old tokens)

**Fix:**

```bash
# Regenerate auth token
POST /auth/login
```

### Issue: Permission Denied on Valid Request

**Check:**

1. User role matches `@Roles()` decorator
2. User has required permission in admin details
3. Resource type and action match exactly
4. Permission conditions (e.g., "own_properties_only") are satisfied

**Debug:**

```typescript
console.log(req.user.roles); // Check actual roles
console.log(user.adminDetails.positionPermissions); // Check permissions
```

### Issue: Event Handler Not Triggered

**Check:**

1. Event is published via `eventPublisher.publish(event)`
2. Handler is registered in module providers
3. Handler class has `@EventsHandler(EventName)` decorator
4. No exception in handler is silently caught
5. Redis/Bull queue is running and healthy

### Issue: Validation Errors Not Clear

**Enable detailed error messages:**

```typescript
new ValidationPipe({
  disableErrorMessages: false, // Show full validation messages
  forbidNonWhitelisted: true, // Reject extra properties
  whitelist: true, // Strip extra properties
});
```

### Best Practices

✅ **DO:**

- Use CQRS for separation of concerns
- Publish events for side effects (emails, notifications)
- Validate input with DTOs and decorators
- Use guards for authorization
- Log errors with context
- Handle async operations with try-catch

❌ **DON'T:**

- Directly query DB in controllers (use services)
- Skip error handling
- Store sensitive data in logs
- Create circular module dependencies
- Use `any` type (use interfaces)
- Hardcode configuration values (use ConfigService)

---

## Next Steps

1. **Start with Authentication**: Understand login/register flow in [03-core-modules.md](#core-modules-deep-dive)
2. **Explore Endpoints**: See all available endpoints in [04-endpoints-reference.md](#api-endpoints-reference)
3. **Learn Database Models**: Check MongoDB schemas in [08-database-models.md](#database-models)
4. **Setup Development**: Follow [docs/setup.md](setup.md)
5. **Test Endpoints**: Use Swagger at `/api/docs` after starting server

---

**Questions?** Check the relevant guide file or search using Ctrl+F for your topic.
