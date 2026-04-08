# Complete Endpoints Reference

This document lists all HTTP endpoints organized by module with request/response schemas.

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Users Endpoints](#users-endpoints)
3. [Properties Endpoints](#properties-endpoints)
4. [Estates Endpoints](#estates-endpoints)
5. [Payments Endpoints](#payments-endpoints)
6. [Levies Endpoints](#levies-endpoints)
7. [Notifications Endpoints](#notifications-endpoints)
8. [Compliance Endpoints](#compliance-endpoints)
9. [Gate Pass Token Endpoints](#gate-pass-token-endpoints)
10. [Audit Logs Endpoints](#audit-logs-endpoints)

---

## Authentication Endpoints

### Base Path: `/auth`

#### POST /auth/register

Register a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678",
  "primaryRole": "tenant"
}
```

**Response (201 Created):**

```json
{
  "message": "Registration successful, please verify your email",
  "email": "user@example.com",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Error (400 Bad Request):**

```json
{
  "success": false,
  "requestId": "req-123",
  "error": {
    "statusCode": 400,
    "type": "BAD_REQUEST",
    "message": "Email already registered",
    "details": ["email must be unique"]
  },
  "timestamp": "2026-02-10T10:30:00Z"
}
```

---

#### POST /auth/login

Authenticate user and initiate login process.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK - Unverified User):**

```json
{
  "status": 222,
  "message": "Email not verified",
  "verified": false,
  "email": "user@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK - Verified User):**

```json
{
  "status": 200,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "ref_token_xyz",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+2348012345678",
    "primaryRole": "tenant",
    "isEmailVerified": true,
    "estateId": "507f1f77bcf86cd799439012",
    "propertyId": "507f1f77bcf86cd799439013"
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "statusCode": 401,
    "type": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

---

#### POST /auth/login/verify

Verify email with OTP during login.

**Request:**

```json
{
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "ref_token_xyz",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "primaryRole": "tenant",
    "isEmailVerified": true
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "statusCode": 401,
    "type": "UNAUTHORIZED",
    "message": "Invalid or expired OTP"
  }
}
```

---

#### POST /auth/verify-preauth

Resolve pre-auth session (email verification or multi-device).

**Request:**

```json
{
  "code": "ABC123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

#### POST /auth/forgot-password

Start password reset process.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "Password reset email sent",
  "email": "user@example.com"
}
```

---

#### POST /auth/verify-reset-otp

Verify OTP for password reset.

**Request:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "message": "OTP verified",
  "resetToken": "reset_token_xyz"
}
```

---

#### POST /auth/reset-password

Set new password after OTP verification.

**Request:**

```json
{
  "resetToken": "reset_token_xyz",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK):**

```json
{
  "message": "Password reset successful"
}
```

---

#### POST /auth/logout

Logout current user (invalidates all tokens).

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "message": "Logout successful"
}
```

---

#### GET /auth/profile

Get current authenticated user profile.

**Request Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678",
  "primaryRole": "tenant",
  "isEmailVerified": true,
  "isMfaEnabled": false,
  "estateId": "507f1f77bcf86cd799439012",
  "propertyId": "507f1f77bcf86cd799439013",
  "createdAt": "2026-01-15T08:00:00Z"
}
```

---

## Users Endpoints

### Base Path: `/users`

All endpoints require `Authorization` header with valid JWT token.

#### POST /users/create/admin

Create a new admin user (Super Admin or Admin only).

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "strongPassword123",
  "firstName": "Jane",
  "lastName": "Manager",
  "phoneNumber": "+2348012345679",
  "primaryRole": "admin",
  "estateId": "507f1f77bcf86cd799439012",
  "adminDetails": {
    "position": "finance_manager",
    "department": "Finance",
    "customPositionTitle": null,
    "positionPermissions": [
      {
        "resource": "finances",
        "actions": ["create", "read", "update", "approve"],
        "conditions": []
      }
    ],
    "additionalPermissions": []
  }
}
```

**Response (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439014",
  "email": "admin@example.com",
  "firstName": "Jane",
  "lastName": "Manager",
  "phoneNumber": "+2348012345679",
  "primaryRole": "admin",
  "isEmailVerified": false,
  "estateId": "507f1f77bcf86cd799439012",
  "adminDetails": {
    "position": "finance_manager",
    "department": "Finance",
    "appointedAt": "2026-02-10T10:00:00Z",
    "appointedBy": "507f1f77bcf86cd799439011"
  },
  "createdAt": "2026-02-10T10:00:00Z"
}
```

---

#### POST /users/create/landlord

Create landlord user.

**Request:**

```json
{
  "email": "landlord@example.com",
  "password": "password123",
  "firstName": "Bob",
  "lastName": "Property",
  "phoneNumber": "+2348012345680",
  "primaryRole": "landlord",
  "estateId": "507f1f77bcf86cd799439012"
}
```

**Response (201 Created):**

```json
{
  "id": "...",
  "email": "landlord@example.com",
  "firstName": "Bob",
  "primaryRole": "landlord",
  "estateId": "507f1f77bcf86cd799439012"
}
```

---

#### POST /users/create/tenant

Create tenant user.

**Request:**

```json
{
  "email": "tenant@example.com",
  "password": "password123",
  "firstName": "Alice",
  "lastName": "Resident",
  "phoneNumber": "+2348012345681",
  "primaryRole": "tenant",
  "estateId": "507f1f77bcf86cd799439012",
  "propertyId": "507f1f77bcf86cd799439013"
}
```

**Response (201 Created):**

```json
{
  "id": "...",
  "email": "tenant@example.com",
  "firstName": "Alice",
  "primaryRole": "tenant",
  "estateId": "507f1f77bcf86cd799439012",
  "propertyId": "507f1f77bcf86cd799439013"
}
```

---

#### POST /users/create/security

Create security personnel user.

**Request:**

```json
{
  "email": "security@example.com",
  "password": "password123",
  "firstName": "Officer",
  "lastName": "Guard",
  "phoneNumber": "+2348012345682",
  "primaryRole": "security",
  "estateId": "507f1f77bcf86cd799439012"
}
```

---

#### GET /users/:id

Get user by ID.

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "primaryRole": "tenant",
  "isEmailVerified": true,
  "adminDetails": null,
  "createdAt": "2026-01-15T08:00:00Z"
}
```

---

#### PATCH /users/:id

Update user profile.

**Request:**

```json
{
  "firstName": "Jonathan",
  "lastName": "Smith",
  "phoneNumber": "+2348012345999"
}
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "Jonathan",
  "lastName": "Smith",
  "phoneNumber": "+2348012345999"
}
```

---

#### DELETE /users/:id

Soft delete user (mark as deleted).

**Response (200 OK):**

```json
{
  "message": "User deleted successfully"
}
```

---

#### POST /users/register-fcm-token

Register Firebase Cloud Messaging token for push notifications.

**Request:**

```json
{
  "token": "esPE2_ABC...",
  "deviceName": "iPhone 14 Pro",
  "platform": "ios"
}
```

**Response (201 Created):**

```json
{
  "message": "FCM token registered",
  "deviceName": "iPhone 14 Pro"
}
```

---

#### POST /users/:id/remove-fcm-token

Remove FCM token (logout from device).

**Request:**

```json
{
  "token": "esPE2_ABC..."
}
```

---

#### PATCH /users/:id/permissions

Update admin permissions (Super Admin only).

**Request:**

```json
{
  "permissionsToAdd": [
    {
      "resource": "properties",
      "actions": ["create", "read", "update"],
      "conditions": []
    }
  ],
  "permissionsToRemove": [
    {
      "resource": "users",
      "actions": ["delete"]
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "message": "Permissions updated",
  "adminDetails": {
    "position": "finance_manager",
    "positionPermissions": [...],
    "additionalPermissions": [
      {
        "resource": "properties",
        "actions": ["create", "read", "update"]
      }
    ]
  }
}
```

---

#### POST /users/:id/enable-token-generation

Enable gate pass generation for user.

**Response (200 OK):**

```json
{
  "message": "Token generation enabled",
  "canGenerateTokens": true
}
```

---

#### POST /users/:id/disable-token-generation

Disable gate pass generation (compliance breach).

**Response (200 OK):**

```json
{
  "message": "Token generation disabled",
  "reason": "Unpaid levies",
  "canGenerateTokens": false
}
```

---

#### PATCH /users/:id/notification-preferences

Update notification settings.

**Request:**

```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "smsNotifications": false,
  "notificationTypes": {
    "levyReminders": true,
    "paymentConfirmation": true,
    "maintenanceAlerts": true,
    "gatePassRequests": true
  }
}
```

**Response (200 OK):**

```json
{
  "message": "Notification preferences updated",
  "preferences": { ... }
}
```

---

## Properties Endpoints

### Base Path: `/properties`

#### POST /properties

Create a new property.

**Request:**

```json
{
  "estateId": "507f1f77bcf86cd799439012",
  "propertyName": "Block A, Unit 5",
  "propertyType": "apartment",
  "address": "123 Estate Drive, Lagos",
  "unitNumber": "A-5",
  "floor": 2,
  "bedroomCount": 3,
  "bathroomCount": 2,
  "squareFootage": 1500,
  "landlordId": "507f1f77bcf86cd799439015",
  "tenantId": "507f1f77bcf86cd799439016",
  "monthlyRent": 500000,
  "leaseStartDate": "2026-01-01",
  "leaseEndDate": "2027-01-01",
  "metadata": {
    "hasParking": true,
    "hasBalkony": true,
    "utilities": ["water", "electricity", "internet"]
  }
}
```

**Response (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439017",
  "estateId": "507f1f77bcf86cd799439012",
  "propertyName": "Block A, Unit 5",
  "propertyType": "apartment",
  "address": "123 Estate Drive, Lagos",
  "unitNumber": "A-5",
  "floor": 2,
  "landlordId": "507f1f77bcf86cd799439015",
  "tenantId": "507f1f77bcf86cd799439016",
  "monthlyRent": 500000,
  "createdAt": "2026-02-10T10:30:00Z"
}
```

---

#### GET /properties

Get all properties.

**Response (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439017",
    "propertyName": "Block A, Unit 5",
    "unitNumber": "A-5",
    "landlordId": "507f1f77bcf86cd799439015",
    "tenantId": "507f1f77bcf86cd799439016",
    "monthlyRent": 500000
  }
]
```

---

#### GET /properties/:id

Get property by ID.

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439017",
  "estateId": "507f1f77bcf86cd799439012",
  "propertyName": "Block A, Unit 5",
  "propertyType": "apartment",
  "address": "123 Estate Drive, Lagos",
  "unitNumber": "A-5",
  "floor": 2,
  "bedroomCount": 3,
  "bathroomCount": 2,
  "landlordId": "507f1f77bcf86cd799439015",
  "tenantId": "507f1f77bcf86cd799439016",
  "monthlyRent": 500000,
  "leaseStartDate": "2026-01-01",
  "leaseEndDate": "2027-01-01",
  "createdAt": "2026-02-10T10:30:00Z"
}
```

---

#### GET /properties/estate/:estateId

Get all properties in an estate.

**Response (200 OK):**

```json
[
  { ...property1 },
  { ...property2 }
]
```

---

#### PATCH /properties/:id

Update property details.

**Request:**

```json
{
  "tenantId": "507f1f77bcf86cd799439018",
  "monthlyRent": 550000,
  "leaseEndDate": "2027-06-01"
}
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439017",
  "propertyName": "Block A, Unit 5",
  "tenantId": "507f1f77bcf86cd799439018",
  "monthlyRent": 550000,
  "updatedAt": "2026-02-10T11:00:00Z"
}
```

---

#### DELETE /properties/:id

Delete property.

**Response (200 OK):**

```json
{
  "message": "Property deleted successfully"
}
```

---

## Payments Endpoints

### Base Path: `/payments`

#### POST /payments

Submit a manual payment.

**Request:**

```json
{
  "levyId": "507f1f77bcf86cd799439019",
  "amount": 50000,
  "paymentMethod": "bank_transfer",
  "proofOfPayment": "https://cloudinary.com/image.jpg",
  "referenceNumber": "TXN-2026-001",
  "notes": "Transferred from GTBank"
}
```

**Response (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439020",
  "levyId": "507f1f77bcf86cd799439019",
  "userId": "507f1f77bcf86cd799439021",
  "amount": 50000,
  "status": "pending",
  "paymentMethod": "bank_transfer",
  "createdAt": "2026-02-10T10:30:00Z"
}
```

---

#### GET /payments/my-payments

Get current user's payment history.

**Response (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "levyId": "507f1f77bcf86cd799439019",
    "levyName": "January Maintenance",
    "amount": 50000,
    "status": "verified",
    "paymentMethod": "bank_transfer",
    "paidAt": "2026-02-10T11:00:00Z"
  }
]
```

---

#### GET /payments/pending

Get all pending payments (Admin only).

**Response (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439021",
    "userName": "John Doe",
    "levyId": "507f1f77bcf86cd799439019",
    "amount": 50000,
    "status": "pending",
    "submittedAt": "2026-02-10T10:30:00Z"
  }
]
```

---

#### GET /payments/:id

Get payment by ID.

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439020",
  "levyId": "507f1f77bcf86cd799439019",
  "userId": "507f1f77bcf86cd799439021",
  "amount": 50000,
  "status": "verified",
  "paymentMethod": "bank_transfer",
  "verifiedBy": "507f1f77bcf86cd799439022",
  "verifiedAt": "2026-02-10T11:00:00Z"
}
```

---

#### PATCH /payments/:id/verify

Verify a pending payment (Admin only).

**Request:**

```json
{
  "verifiedAmount": 50000,
  "notes": "Receipt verified"
}
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439020",
  "status": "verified",
  "verifiedAmount": 50000,
  "verifiedBy": "507f1f77bcf86cd799439022",
  "verifiedAt": "2026-02-10T11:00:00Z"
}
```

---

#### PATCH /payments/:id/reject

Reject a payment (Admin only).

**Request:**

```json
{
  "rejectionReason": "Receipt unclear"
}
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439020",
  "status": "rejected",
  "rejectionReason": "Receipt unclear",
  "rejectedAt": "2026-02-10T11:05:00Z"
}
```

---

#### POST /payments/initialize-paystack

Initialize Paystack online payment.

**Request:**

```json
{
  "levyId": "507f1f77bcf86cd799439019",
  "amount": 50000
}
```

**Response (200 OK):**

```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "access_code_xyz",
  "reference": "TXN_2026_..."
}
```

---

#### GET /payments/levy/:levyId

Get all payments for a levy (Admin only).

**Response (200 OK):**

```json
[
  { ...payment1 },
  { ...payment2 }
]
```

---

## Levies Endpoints

### Base Path: `/levies`

#### POST /levies

Create a new levy.

**Request:**

```json
{
  "estateId": "507f1f77bcf86cd799439012",
  "name": "Maintenance Levy - February 2026",
  "description": "Monthly maintenance for estate upkeep",
  "levyType": "maintenance",
  "totalAmount": 50000,
  "dueDate": "2026-02-28",
  "properties": ["507f1f77bcf86cd799439017", "507f1f77bcf86cd799439023"]
}
```

**Response (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439024",
  "estateId": "507f1f77bcf86cd799439012",
  "name": "Maintenance Levy - February 2026",
  "levyType": "maintenance",
  "totalAmount": 50000,
  "amountPaid": 0,
  "isPaid": false,
  "dueDate": "2026-02-28",
  "createdAt": "2026-02-10T10:30:00Z"
}
```

---

#### GET /levies

Get all levies.

**Response (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439024",
    "name": "Maintenance Levy - February 2026",
    "totalAmount": 50000,
    "amountPaid": 30000,
    "isPaid": false,
    "dueDate": "2026-02-28"
  }
]
```

---

#### GET /levies/:id

Get levy by ID.

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439024",
  "estateId": "507f1f77bcf86cd799439012",
  "name": "Maintenance Levy - February 2026",
  "description": "Monthly maintenance for estate upkeep",
  "levyType": "maintenance",
  "totalAmount": 50000,
  "amountPaid": 30000,
  "isPaid": false,
  "dueDate": "2026-02-28",
  "tenants": [
    {
      "userId": "507f1f77bcf86cd799439021",
      "name": "John Doe",
      "amountOwed": 20000
    }
  ]
}
```

---

#### PATCH /levies/:id

Update levy details.

**Request:**

```json
{
  "name": "Maintenance Levy - Updated",
  "dueDate": "2026-03-01"
}
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439024",
  "name": "Maintenance Levy - Updated",
  "dueDate": "2026-03-01"
}
```

---

## Gate Pass Token Endpoints

### Base Path: `/gatePassToken`

#### POST /gatePassToken

Generate a visitor gate pass token.

**Request:**

```json
{
  "visitorName": "John Smith",
  "visitorEmail": "visitor@example.com",
  "visitorPhone": "+2348012345690",
  "purpose": "Friend visit",
  "expectedArrivalTime": "2026-02-10T15:00:00Z",
  "expectedDepartureTime": "2026-02-10T18:00:00Z",
  "propertyId": "507f1f77bcf86cd799439017"
}
```

**Response (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439025",
  "token": "GT-2026-ABC123XYZ",
  "visitorName": "John Smith",
  "purpose": "Friend visit",
  "expectedArrivalTime": "2026-02-10T15:00:00Z",
  "expectedDepartureTime": "2026-02-10T18:00:00Z",
  "status": "active",
  "createdAt": "2026-02-10T10:30:00Z"
}
```

---

#### GET /gatePassToken/my-tokens

Get current user's generated tokens.

**Response (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439025",
    "token": "GT-2026-ABC123XYZ",
    "visitorName": "John Smith",
    "status": "active",
    "expectedArrivalTime": "2026-02-10T15:00:00Z"
  }
]
```

---

#### PATCH /gatePassToken/:id/verify

Verify token at gate (Security only).

**Request:**

```json
{
  "visitorPresent": true,
  "notes": "Visitor in Gate A"
}
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439025",
  "status": "verified",
  "verifiedAt": "2026-02-10T15:05:00Z"
}
```

---

#### PATCH /gatePassToken/:id/revoke

Revoke a token.

**Request:**

```json
{
  "reason": "Cancelled by tenant"
}
```

**Response (200 OK):**

```json
{
  "id": "507f1f77bcf86cd799439025",
  "status": "revoked",
  "revokedAt": "2026-02-10T15:10:00Z"
}
```

---

## Notifications Endpoints

### Base Path: `/notifications`

#### POST /notifications/send-bulk

Send notification to multiple users (Admin only).

**Request:**

```json
{
  "recipientIds": ["507f1f77bcf86cd799439021", "507f1f77bcf86cd799439026"],
  "type": "announcement",
  "title": "Estate Maintenance",
  "message": "Estate maintenance scheduled for Feb 15",
  "channels": ["email", "push"],
  "relatedEntityId": "507f1f77bcf86cd799439019"
}
```

**Response (201 Created):**

```json
{
  "message": "Notifications sent successfully",
  "succeededCount": 2,
  "failedCount": 0
}
```

---

#### GET /notifications

Get current user's notifications.

**Response (200 OK):**

```json
{
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439027",
      "type": "announcement",
      "title": "Estate Maintenance",
      "message": "Estate maintenance scheduled for Feb 15",
      "read": false,
      "createdAt": "2026-02-10T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

## Audit Logs Endpoints

### Base Path: `/audit-logs`

#### GET /audit-logs

Get audit logs (Admin only).

**Query Parameters:**

- `userId` - Filter by user
- `action` - Filter by action
- `entityType` - Filter by entity type
- `limit` - Results per page (default: 50)
- `skip` - Pagination offset

**Response (200 OK):**

```json
{
  "logs": [
    {
      "id": "507f1f77bcf86cd799439028",
      "userId": "507f1f77bcf86cd799439011",
      "userName": "John Doe",
      "action": "create",
      "entityType": "property",
      "entityId": "507f1f77bcf86cd799439017",
      "timestamp": "2026-02-10T10:30:00Z",
      "changes": { "propertyName": "Block A, Unit 5" }
    }
  ],
  "total": 1250
}
```

---

**API Documentation:** Access Swagger UI at `/api/docs` after starting the server.
