# Quick Start Guide for New Developers

Welcome to the Estate Management System! This guide will help you get started quickly.

---

## 📖 Reading Order

Start with these files in this order:

1. **[CODEBASE_GUIDE.md](CODEBASE_GUIDE.md)** ← START HERE

   - High-level overview
   - Request-to-response flow
   - Technology stack

2. **[03-core-modules.md](03-core-modules.md)**

   - Auth, Users, Payments modules
   - Key workflows
   - Code snippets

3. **[04-endpoints-reference.md](04-endpoints-reference.md)**

   - All API endpoints
   - Request/response schemas
   - Use for testing

4. **[05-cqrs-pattern.md](05-cqrs-pattern.md)**

   - How commands and queries work
   - Writing new handlers
   - Testing patterns

5. **[06-cross-cutting-concerns.md](06-cross-cutting-concerns.md)**

   - Middleware, guards, filters, interceptors
   - Authentication flow
   - Error handling

6. **[07-event-driven-architecture.md](07-event-driven-architecture.md)**

   - Async event handling
   - Event publishing
   - Complete examples

7. **[08-database-models.md](08-database-models.md)**
   - MongoDB schemas
   - Relationships
   - Queries

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+
- Git

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd "Estate Management"

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.development

# 4. Configure .env.development
MONGODB_URI=mongodb://localhost:27017/estate-management
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### Start Services

```bash
# Terminal 1: MongoDB
mongod --dbpath ./data/mongo

# Terminal 2: Redis
redis-server

# Terminal 3: Application
npm run start:dev
```

### Access Points

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **BullBoard (Job Queue)**: http://localhost:3000/admin/queues
- **WebSocket**: ws://localhost:3000

---

## 🏛️ Project Structure Quick Reference

```
src/
├── auth/              → Login, register, JWT tokens
├── users/             → User management, roles, permissions
├── properties/        → Property registry
├── estates/           → Estate/community management
├── payments/          → Payment processing
├── levies/            → Assessment fees
├── notifications/     → Email & push notifications
├── gatePassToken/     → Visitor access tokens
├── compliance/        → Automated enforcement
├── audit-logs/        → Action tracking
└── common/            → Shared utilities
    ├── middleware/    → Request logging
    ├── guards/        → Auth guards (JWT, roles, permissions)
    ├── filters/       → Exception handling
    ├── interceptors/  → Response transformation
    ├── services/      → Mail, logger, event publisher
    ├── database/      → Mongoose plugins (soft delete)
    └── utils/         → Helper functions
```

---

## 👤 User Roles & Permissions

### Role Hierarchy

```
Super Admin (1 system-wide)
    ├─ Can create/manage all admins
    ├─ Full system access
    └─ Typically is only initial account

Admin (Estate-specific)
    ├─ Positions: Finance Manager, Security Head, etc.
    ├─ Granular permissions per position
    └─ Limited to their estate

Landlord
    ├─ Own properties
    ├─ Receive payments
    └─ No administrative access

Tenant
    ├─ Pay levies
    ├─ Request gate passes
    └─ View their property info

Security
    ├─ Verify gate passes
    ├─ Limited read-only access
    └─ No admin capabilities
```

### Permission System

```typescript
// Every admin has permissions like:
{
  resource: 'properties',      // What they can manage
  actions: ['create', 'read'], // What they can do
  conditions: []               // Any special conditions
}
```

---

## 🔐 Authentication Flow

### Step 1: Register

```bash
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "primaryRole": "tenant"
}
```

→ Verification email sent

### Step 2: Verify Email

```bash
POST /auth/verify-preauth
{
  "code": "ABC123"
}
```

→ Email verified

### Step 3: Login

```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

→ OTP sent (two-step verification)

### Step 4: Verify Login

```bash
POST /auth/login/verify
{
  "otp": "123456"
}
```

→ JWT token returned

### Step 5: Use Token

```bash
GET /users/profile
Authorization: Bearer <JWT_TOKEN>
```

→ Access protected endpoints

---

## 💰 Payment Flow

### Manual Payment

```
Tenant submits payment
    ↓
Admin reviews proof
    ↓
Admin verifies or rejects
    ↓
Payment recorded
    ↓
Compliance checked (levies paid?)
    ↓
Gate pass generation enabled/disabled
```

### Online Payment (Paystack)

```
Tenant initiates online payment
    ↓
Redirected to Paystack checkout
    ↓
Tenant completes payment on Paystack
    ↓
Paystack webhook → our API
    ↓
Payment verified
    ↓
Auto-compliance check
```

---

## 🛠️ Creating a New Endpoint

### 1. Create Command/Query

```typescript
// src/mymodule/cqrs/commands/impl/my-action.command.ts
export class MyActionCommand implements ICommand {
  constructor(readonly data: MyActionDto) {}
}
```

### 2. Create Handler

```typescript
// src/mymodule/cqrs/commands/handlers/my-action.handler.ts
@CommandHandler(MyActionCommand)
export class MyActionHandler implements ICommandHandler<MyActionCommand> {
  async execute(command: MyActionCommand): Promise<any> {
    try {
      // 1. Validate
      // 2. Database operation
      // 3. Publish event
      // 4. Return result
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
```

### 3. Create Controller Endpoint

```typescript
// src/mymodule/mymodule.controller.ts
@Post('my-action')
@UseGuards(JwtAuthGuard, VerifiedGuard)
@Roles(UserRole.ADMIN)
async myAction(@Body() dto: MyActionDto) {
  return this.commandBus.execute(new MyActionCommand(dto));
}
```

### 4. Register Handler in Module

```typescript
// src/mymodule/mymodule.module.ts
@Module({
  imports: [CqrsModule],
  controllers: [MyModuleController],
  providers: [MyActionHandler, ...otherHandlers],
})
export class MyModuleModule {}
```

### 5. Test with Swagger

Go to http://localhost:3000/api/docs

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Test specific file
npm test -- users.service

# Coverage
npm test:cov
```

### Test Template

```typescript
describe('CreateAdminHandler', () => {
  let handler: CreateAdminHandler;
  let userModel: Model<User>;

  beforeEach(async () => {
    // Setup
    userModel = { ...mockModel };
    handler = new CreateAdminHandler(userModel, eventPublisher);
  });

  it('should create admin and publish event', async () => {
    const command = new CreateAdminCommand(dto, createdBy);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(eventPublisher.publish).toHaveBeenCalled();
  });

  it('should throw if email exists', async () => {
    userModel.findOne.mockResolvedValue({ email: 'exists' });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
```

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid JWT"

**Cause:** Token expired or JWT_SECRET mismatch

**Fix:**

```bash
# Check .env file
echo $JWT_SECRET

# Update JWT_SECRET in .env if needed
# Restart application
npm run start:dev
```

### Issue: "Forbidden: Insufficient permissions"

**Cause:** User role or admin permissions not enough

**Fix:**

1. Check user's `primaryRole`
2. If admin, check `adminDetails.positionPermissions`
3. Grant required permission via admin update endpoint

### Issue: "MongoDB connection failed"

**Cause:** MongoDB not running or wrong URI

**Fix:**

```bash
# Start MongoDB
mongod --dbpath ./data/mongo

# Check URI in .env
MONGODB_URI=mongodb://localhost:27017/estate-management
```

### Issue: "Email not sending"

**Cause:** Nodemailer config wrong or SMTP server down

**Fix:**

1. Check email service credentials in `.env`
2. Check BullBoard queue status: http://localhost:3000/admin/queues
3. If job stuck, restart Redis: `redis-cli FLUSHDB`

---

## 📚 Key Concepts

### CQRS (Command Query Responsibility Segregation)

- **Commands** = Write operations (Create, Update, Delete)
- **Queries** = Read operations (Get, Find, List)
- **Benefit**: Separation of concerns, easier testing

### Event-Driven Architecture

- Actions publish **events** (e.g., `PaymentVerifiedEvent`)
- Multiple **handlers** subscribe to events
- Handlers react asynchronously (send email, audit log, etc.)
- **Benefit**: Decoupled, scalable, non-blocking

### RBAC (Role-Based Access Control)

- **Roles**: Super Admin, Admin, Landlord, Tenant, Security
- **Permissions**: Granular (create/read/update/delete on specific resources)
- **Guards**: Enforced at controller level

### Soft Deletes

- Records marked `deletedAt` instead of removed
- Queries automatically exclude soft-deleted records
- **Benefit**: Data recovery, audit trails

---

## 📞 Getting Help

1. **Search the documentation** - Most answers are in the 8 guides
2. **Check CODEBASE_GUIDE.md** - For high-level overview
3. **Check Swagger** - http://localhost:3000/api/docs
4. **Look at console logs** - Full error stack logged internally
5. **Check BullBoard** - http://localhost:3000/admin/queues for async job status
6. **Ask in team chat** - With error screenshot and steps to reproduce

---

## 📊 Useful Queries

### Find all pending payments

```bash
curl -X GET http://localhost:3000/payments/pending \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Create a test tenant

```bash
curl -X POST http://localhost:3000/users/create/tenant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "email": "tenant@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Tenant",
    "primaryRole": "tenant",
    "estateId": "507f1f77bcf86cd799439012",
    "propertyId": "507f1f77bcf86cd799439013"
  }'
```

### Check user permissions

```bash
curl -X GET http://localhost:3000/users/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## ✅ Checklist Before First PR

- [ ] Read all 8 documentation files
- [ ] Created a feature branch: `git checkout -b feature/my-feature`
- [ ] Made changes following the CQRS pattern
- [ ] Added/updated unit tests
- [ ] Tested endpoint in Swagger or Postman
- [ ] Checked error handling (guards, filters, validation)
- [ ] Verified event publishing (check BullBoard)
- [ ] Ran linter: `npm run lint`
- [ ] Formatted code: `npm run format`
- [ ] Tested locally: `npm run start:dev`

---

## 🎓 Next Learning Resources

1. **TypeScript**: https://www.typescriptlang.org/docs
2. **NestJS**: https://docs.nestjs.com
3. **MongoDB**: https://docs.mongodb.com
4. **CQRS Pattern**: https://martinfowler.com/bliki/CQRS.html
5. **Event Sourcing**: https://martinfowler.com/eaaDev/EventSourcing.html

---

## 📝 Notes

- All times are UTC unless specified otherwise
- Sensitive data (passwords, tokens) never logged
- Always use `await` for async operations
- Always use transactions for multi-entity changes
- Always publish events for side effects
- Always test error cases, not just happy path

---

**You're ready to start!** 🚀

Ask in team chat if you get stuck. Welcome to the team! 👋
