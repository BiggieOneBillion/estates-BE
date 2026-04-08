# Cross-Cutting Concerns

This document explains the middleware, guards, filters, and interceptors that handle request/response lifecycle.

---

## Overview

```
HTTP Request
    ↓
1. CORS Middleware
    ↓
2. Logger Middleware (log request details)
    ↓
3. Global Validation Pipe (validate & transform DTOs)
    ↓
4. Route Handler (Controller method)
    ↓
5. Authentication Guards (JWT validation)
    ├─ JwtAuthGuard
    ├─ VerifiedGuard
    ├─ RolesGuard
    └─ PermissionsGuard
    ↓
6. CQRS Handler (execute command/query)
    ↓
7. Response Transformation (DTO mapping)
    ↓
8. HTTP Exception Filter (error handling)
    ↓
9. Audit Interceptor (log the action)
    ↓
HTTP Response
```

---

## 1. Middleware

### Logger Middleware

**Location:** `src/common/middleware/logger.middleware.ts`

**Purpose:** Log every HTTP request and response with timing.

**Implementation:**

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const start = Date.now();

    logger.info(`REQUEST STARTED ➡️ [${method}] ${originalUrl}`);
    logger.info(`Body: ${JSON.stringify(body)}`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(
        `RESPONSE ⬅️ [${method}] ${originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
```

**Registration:**

```typescript
// src/app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
```

**Output:**

```
REQUEST STARTED ➡️ [POST] /auth/login
Body: {"email":"user@example.com","password":"..."}
RESPONSE ⬅️ [POST] /auth/login 200 - 245ms
```

---

## 2. Guards (Authorization)

Guards execute **after middleware but before route handler**. They return `boolean` to allow/deny.

### 2.1 JWT Auth Guard

**Location:** `src/auth/guards/jwt-auth.guard.ts`

**Purpose:** Validate JWT token and attach user info to request.

**Implementation:**

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Skip for public routes (register, login, forgot-password)
    const publicRoutes = [
      '/auth/register',
      '/auth/login',
      '/auth/forgot-password',
    ];
    if (publicRoutes.some((route) => request.path.includes(route))) {
      return true;
    }

    // Validate JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw new UnauthorizedException(
        info?.message || 'Invalid or expired token',
      );
    }
    return user; // Attached to req.user
  }
}
```

**Usage:**

```typescript
@UseGuards(JwtAuthGuard)
@Post('create-property')
async createProperty(@Body() dto: CreatePropertyDto) { ... }
```

**What happens:**

1. Client sends `Authorization: Bearer <JWT_TOKEN>`
2. JwtAuthGuard validates signature with JWT_SECRET
3. If valid, decoded payload attached to `req.user`
4. If invalid, throws `UnauthorizedException`

### JWT Payload

```typescript
// What's inside the JWT token when decoded
{
  sub: "507f1f77bcf86cd799439011",  // User ID
  email: "user@example.com",
  roles: "tenant",
  type: "auth",                      // "pre-auth" for pending email verification
  isVerified: true,
  version: 0,                        // Token version for invalidation
  iat: 1707547800,                   // Issued at
  exp: 1739083800                    // Expiration
}
```

### 2.2 Verified Guard

**Location:** `src/auth/guards/verified.guard.ts`

**Purpose:** Ensure user's email is verified.

**Implementation:**

```typescript
@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    // For pre-auth tokens, reject
    if (user.type === 'pre-auth') {
      throw new ForbiddenException(
        'Please verify your email before accessing this resource',
      );
    }

    // Verify user still exists and is verified
    const dbUser = await this.userModel.findById(user.sub);
    if (!dbUser || !dbUser.isEmailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    return true;
  }
}
```

**Usage:**

```typescript
@UseGuards(JwtAuthGuard, VerifiedGuard)
@Post('create-admin')
async createAdmin(@Body() dto: CreateAdminRequestDto) { ... }
```

### 2.3 Roles Guard

**Location:** `src/auth/guards/roles.guard.ts`

**Purpose:** Check if user has required role.

**Implementation:**

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles', // Metadata key from @Roles decorator
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.roles)) {
      throw new ForbiddenException('Insufficient role privileges');
    }

    return true;
  }
}
```

**Usage:**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Post('create-admin')
async createAdmin(@Body() dto: CreateAdminRequestDto) { ... }
```

**Decorator:**

```typescript
// src/auth/decorators/role.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

### 2.4 Permissions Guard

**Location:** `src/auth/guards/permissions.guard.ts`

**Purpose:** Check granular resource permissions.

**Implementation:**

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<{
      resource: ResourceType;
      action: PermissionAction;
    }>('permission', [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true; // No permission restriction
    }

    const { user } = context.switchToHttp().getRequest();
    const dbUser = await this.userModel.findById(user.sub);

    const hasPermission = this.checkPermission(
      dbUser,
      requiredPermission.resource,
      requiredPermission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing permission: ${requiredPermission.action} on ${requiredPermission.resource}`,
      );
    }

    return true;
  }

  private checkPermission(
    user: User,
    resource: ResourceType,
    action: PermissionAction,
  ): boolean {
    if (user.primaryRole === UserRole.SUPER_ADMIN) {
      return true; // Super admins have all permissions
    }

    if (user.primaryRole !== UserRole.ADMIN) {
      return false; // Only admins have granular permissions
    }

    // Check position or additional permissions
    const allPermissions = [
      ...user.adminDetails.positionPermissions,
      ...user.adminDetails.additionalPermissions,
    ];

    return allPermissions.some(
      (p) => p.resource === resource && p.actions.includes(action),
    );
  }
}
```

**Usage:**

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission(ResourceType.PROPERTIES, PermissionAction.CREATE)
@Post('create-property')
async createProperty(@Body() dto: CreatePropertyDto) { ... }
```

**Decorator:**

```typescript
export const RequirePermission = (
  resource: ResourceType,
  action: PermissionAction,
) => SetMetadata('permission', { resource, action });
```

---

## 3. Pipes (Validation & Transformation)

### Global Validation Pipe

**Location:** `src/main.ts`

**Purpose:** Validate request body against DTOs, or reject invalid data.

**Configuration:**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true, // Auto-transform primitives to DTO class
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw if unknown properties present
    disableErrorMessages: false, // Include detailed error messages
  }),
);
```

**What it does:**

```typescript
// Request
POST /auth/register
{
  "email": "user@example.com",
  "password": "pass123",
  "firstName": "John",
  "extraField": "should be stripped"
}

// DTO
export class RegisterRequestDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;
}

// Validation Pipe:
// ✓ Validates: email is valid, password >= 8 chars
// ✗ Strips: extraField (whitelist: true)
// ✗ Throws: If extraField present and forbidNonWhitelisted: true
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "details": [
      "password must be longer than or equal to 8 characters",
      "property extraField should not exist"
    ]
  }
}
```

---

## 4. Exception Filters

### HTTP Exception Filter

**Location:** `src/common/filters/http-exception.filter.ts`

**Purpose:** Catch and normalize HTTP exceptions.

**Implementation:**

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Internal error message (for logging)
    const internalMessage = exception.getResponse()['message'];

    // Map to safe public message
    const publicError = normalizeError(exception.name, internalMessage);

    const errorResponse = {
      success: false,
      requestId: request.headers['x-request-id'] || 'system',
      error: {
        statusCode: publicError.statusCode,
        type: publicError.type,
        message: publicError.message,
        details: Array.isArray(internalMessage) ? internalMessage : undefined,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log full error internally
    logger.error(`[${errorResponse.requestId}] ${exception.message}`, {
      stack: exception.stack,
    });

    response.status(publicError.statusCode).json(errorResponse);
  }
}
```

### Generic Exception Filter

**Purpose:** Catch unexpected errors (500s).

**Implementation:**

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      success: false,
      requestId: 'system',
      error: {
        statusCode: status,
        type: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred', // Safe message
      },
      timestamp: new Date().toISOString(),
    };

    // Log full details internally
    logger.error('UNHANDLED_EXCEPTION', {
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }
}
```

**Registration:**

```typescript
// src/main.ts
app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());
```

---

## 5. Interceptors

### Audit Interceptor

**Location:** `src/common/interceptors/audit.interceptor.ts`

**Purpose:** Log every action to audit trail, including changes.

**Implementation:**

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, user, body } = request;

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        // Only log write operations
        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
          return;
        }

        const duration = Date.now() - startTime;

        // Extract what changed
        const changes = this.extractChanges(method, body, data);

        // Create audit log
        this.createAuditLog({
          userId: user?.sub,
          action: this.getAction(method),
          entityType: this.getEntityType(originalUrl),
          entityId: data?.id || this.extractIdFromUrl(originalUrl),
          changes,
          timestamp: new Date(),
          statusCode: 200,
          duration,
        });
      }),
      catchError((error) => {
        // Also log failed operations
        this.createAuditLog({
          userId: user?.sub,
          action: this.getAction(method),
          entityType: this.getEntityType(originalUrl),
          timestamp: new Date(),
          statusCode: error.status || 500,
          error: error.message,
        });
        throw error;
      }),
    );
  }

  private getAction(method: string): string {
    const actions = {
      POST: 'create',
      PATCH: 'update',
      PUT: 'replace',
      DELETE: 'delete',
    };
    return actions[method] || 'unknown';
  }

  private getEntityType(url: string): string {
    // Extract from /users/:id -> 'user'
    const match = url.match(/\/(\w+)\//);
    return match ? match[1].slice(0, -1) : 'unknown';
  }
}
```

**Registration:**

```typescript
// src/app.module.ts
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
```

**Output:**

```
Audit Log Entry:
{
  userId: "507f1f77bcf86cd799439011",
  action: "create",
  entityType: "property",
  entityId: "507f1f77bcf86cd799439017",
  changes: {
    propertyName: "Block A, Unit 5",
    unitNumber: "A-5",
    floor: 2
  },
  timestamp: "2026-02-10T10:30:00Z",
  statusCode: 201,
  duration: 145
}
```

---

## Complete Request Lifecycle Example

### Scenario: Create Admin User

```
1. Client sends request
   POST /users/create/admin
   Authorization: Bearer eyJhbGc...
   Content-Type: application/json
   Body: {
     "email": "admin@example.com",
     "password": "strongPassword123",
     "primaryRole": "admin",
     "adminDetails": { ... }
   }

2. CORS Middleware
   ✓ Checks origin, allows request

3. Logger Middleware
   → logs: REQUEST STARTED ➡️ [POST] /users/create/admin

4. Global Validation Pipe
   ✓ Validates CreateAdminRequestDto
   ✓ Transforms data
   ✗ Would throw if invalid

5. Controller method hit
   UsersController.createAdmins()

6. Decorators execute metadata
   → @UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard, PermissionsGuard)
   → @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
   → @RequirePermission(ResourceType.ADMINS, PermissionAction.CREATE)

7. Guards execute in order

   a) JwtAuthGuard
      ✓ Validates JWT signature
      ✓ Decodes payload
      ✓ Attaches user info to req.user

   b) VerifiedGuard
      ✓ Checks user.type !== 'pre-auth'
      ✓ Verifies isEmailVerified in DB

   c) RolesGuard
      ✓ Checks @Roles decorator
      ✓ Verifies user.roles includes admin/super_admin

   d) PermissionsGuard
      ✓ Checks @RequirePermission decorator
      ✓ Verifies user has CREATE on ADMINS resource

8. CQRS Handler executes
   CreateAdminHandler.execute(CreateAdminCommand)
   ├─ Hash password
   ├─ Check email unique
   ├─ Start database transaction
   ├─ Save new admin user
   ├─ Publish AdminUserCreatedEvent
   ├─ Commit transaction
   └─ Return saved user

9. Event handlers triggered (async)
   ├─ AuditLogHandler → logs creation
   └─ NotificationHandler → sends welcome email

10. Response mapped to DTO
    UserResponseDto (excludes password, tokens)

11. Audit Interceptor logs action
    {
      action: 'create',
      entityType: 'user',
      entityId: '507f...',
      changes: { email, primaryRole, ... }
    }

12. Success Response sent
    {
      "success": true,
      "data": {
        "id": "507f...",
        "email": "admin@example.com",
        "primaryRole": "admin",
        "adminDetails": { ... }
      },
      "requestId": "req-123",
      "timestamp": "2026-02-10T10:30:00Z"
    }

13. Logger Middleware logs response
    → RESPONSE ⬅️ [POST] /users/create/admin 201 - 342ms
```

---

## Error Handling Example

### Scenario: Invalid JWT Token

```
1. Client sends request with expired token
   Authorization: Bearer eyJhbGc... (expired)

2. Validation/Guards execute
   JwtAuthGuard.canActivate()
   → Passport JWT strategy validates signature
   → Token is expired
   → Throws UnauthorizedException

3. Exception Filter catches
   HttpExceptionFilter.catch(UnauthorizedException)
   ├─ Extracts status: 401
   ├─ Gets message: "Unauthorized"
   ├─ Normalizes to public error
   ├─ Logs full stack internally
   └─ Returns error response

4. Error Response sent
   {
     "success": false,
     "error": {
       "statusCode": 401,
       "type": "UNAUTHORIZED",
       "message": "Invalid or expired token"
     },
     "requestId": "req-123",
     "timestamp": "2026-02-10T10:30:15Z"
   }
```

---

## Best Practices

✅ **DO:**

- Use guards for authorization
- Create specific decorators for common patterns
- Log sensitive errors internally, safe messages to client
- Validate all input with DTOs
- Use interceptors for cross-cutting concerns

❌ **DON'T:**

- Skip error handling
- Expose stack traces to clients
- Trust client-provided data
- Forget to apply guards to protected routes
- Use hardcoded role checks in controllers

---

**Next:** See [07-event-driven-architecture.md](07-event-driven-architecture.md) for async event handling.
