# Database Models & MongoDB Schemas

This document explains the MongoDB schemas for all major entities.

---

## Database Configuration

**Location:** `src/config/database.config.ts`

```typescript
export class DatabaseConfig {
  getMongoConfig() {
    return {
      uri: this.configService.get(
        'MONGODB_URI',
        'mongodb://localhost:27017/estate-management',
      ),
      retryWrites: true,
      authSource: 'admin',
    };
  }
}
```

---

## Entity Relationship Diagram

```
User (people in system)
├── primaryRole
├── estateId → Estate
├── propertyId → Property (if tenant/landlord)
└── adminDetails (if role=admin)

Estate (residential community)
├── name, location
├── properties: Property[]
└── tenants: User[]

Property (individual unit)
├── estateId → Estate
├── landlordId → User
├── tenantId → User
└── leases, rent, etc.

Levy (assessment/fee)
├── estateId → Estate
├── propertyIds: Property[]
├── tenantIds: User[]
└── payment tracking

Payment (transaction record)
├── levyId → Levy
├── userId → User
├── verification tracking
└── proof of payment

AuditLog (action tracking)
├── userId → User
├── entityType (user, property, payment, etc.)
├── action (create, update, delete, verify)
└── changes, timestamp

GatePassToken (visitor access)
├── propertyId → Property
├── createdById → User
└── verification tracking
```

---

## User Model

**Location:** `src/users/entities/user.entity.ts`

**Purpose:** Store user account and authentication data.

### Schema

```typescript
@Schema({ timestamps: true })
export class User extends Document {
  // Authentication
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string; // Hashed with bcrypt

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phoneNumber: string;

  @Prop({ required: true, enum: UserRole })
  primaryRole: UserRole; // super_admin, admin, site_admin, landlord, tenant, security

  // Email Verification
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  verificationToken: string; // 6-digit OTP

  @Prop()
  verificationTokenExpiry: Date;

  // MFA (Multi-Factor Authentication)
  @Prop({ default: false })
  isMfaEnabled: boolean;

  // Token Management
  @Prop({ default: 0 })
  tokenVersion: number; // Incrementing this invalidates all old tokens

  @Prop({ type: [String], default: [] })
  fcmTokens: string[]; // Firebase Cloud Messaging tokens for push notifications

  // References
  @Prop({ type: Schema.Types.ObjectId, ref: 'Estate' })
  estateId: Schema.Types.ObjectId;

  @Prop({ type: Schema.Types.ObjectId, ref: 'Property' })
  propertyId: Schema.Types.ObjectId; // For tenant/landlord

  // Role-Specific Details (embedded subdocument)
  @Prop({ type: AdminDetails })
  adminDetails?: AdminDetails; // If role=admin

  @Prop({ type: Object })
  landlordDetails?: any; // If role=landlord

  @Prop({ type: Object })
  tenantDetails?: any; // If role=tenant

  @Prop({ type: Object })
  securityDetails?: any; // If role=security

  // Permissions (for non-admin users)
  @Prop({ type: [Permission], default: [] })
  permissions: Permission[];

  // Notification Preferences
  @Prop({
    type: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      notificationTypes: {
        levyReminders: { type: Boolean, default: true },
        paymentConfirmation: { type: Boolean, default: true },
        maintenanceAlerts: { type: Boolean, default: true },
      },
    },
    default: {},
  })
  notificationPreferences: any;

  // Gate Pass Permissions
  @Prop({ default: true })
  canGenerateTokens: boolean; // Disabled if levies unpaid

  // Metadata
  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  createdBy: Schema.Types.ObjectId; // Which user/admin created this

  @Prop()
  lastLogin: Date;

  @Prop()
  deletedAt: Date; // For soft delete

  // Timestamps (automatic)
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
```

### Subdocument: AdminDetails

```typescript
@Schema({ _id: false })
export class AdminDetails {
  @Prop({ enum: AdminPosition, required: true })
  position: AdminPosition; // facility_manager, security_head, finance_manager, etc.

  @Prop()
  customPositionTitle?: string; // If position=custom

  @Prop()
  department?: string;

  @Prop({ type: [Permission], required: true })
  positionPermissions: Permission[]; // Default permissions for this position

  @Prop({ type: [Permission], default: [] })
  additionalPermissions: Permission[]; // Granted by super_admin

  @Prop({ default: Date.now })
  appointedAt: Date;

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  appointedBy: Schema.Types.ObjectId; // Which super_admin appointed

  @Prop()
  notes?: string;
}
```

### Subdocument: Permission

```typescript
@Schema({ _id: false })
export class Permission {
  @Prop({ required: true, enum: ResourceType })
  resource: ResourceType; // USERS, PROPERTIES, FINANCES, etc.

  @Prop({ type: [String], enum: PermissionAction, required: true })
  actions: PermissionAction[]; // CREATE, READ, UPDATE, DELETE, APPROVE

  @Prop({ type: [String], default: [] })
  conditions?: string[]; // e.g., "own_properties_only", "own_estate_only"
}
```

### Enums

```typescript
export enum UserRole {
  SUPER_ADMIN = 'super_admin', // 1 system-wide
  SITE_ADMIN = 'site_admin', // Physical gate administrators
  ADMIN = 'admin', // Estate-specific managers
  LANDLORD = 'landlord', // Property owners
  TENANT = 'tenant', // Residents
  SECURITY = 'security', // Gate/security personnel
}

export enum AdminPosition {
  FACILITY_MANAGER = 'facility_manager',
  SECURITY_HEAD = 'security_head',
  MAINTENANCE_SUPERVISOR = 'maintenance_supervisor',
  FINANCE_MANAGER = 'finance_manager',
  OPERATIONS_MANAGER = 'operations_manager',
  PROPERTY_MANAGER = 'property_manager',
  TENANT_RELATIONS = 'tenant_relations',
  SUPER_ADMIN = 'super_admin',
  CUSTOM = 'custom',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full control
  APPROVE = 'approve',
  ASSIGN = 'assign',
}

export enum ResourceType {
  USERS = 'users',
  TENANTS = 'tenants',
  LANDLORDS = 'landlords',
  ADMINS = 'admins',
  SECURITY = 'security',
  PROPERTIES = 'properties',
  MAINTENANCE = 'maintenance',
  FINANCES = 'finances',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  PERMISSIONS = 'permissions',
}
```

### Sample Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "password": "$2b$10$...",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678",
  "primaryRole": "tenant",
  "isEmailVerified": true,
  "estateId": "507f1f77bcf86cd799439012",
  "propertyId": "507f1f77bcf86cd799439013",
  "canGenerateTokens": true,
  "fcmTokens": ["fcm_token_123", "fcm_token_456"],
  "notificationPreferences": {
    "emailNotifications": true,
    "pushNotifications": true,
    "notificationTypes": {
      "levyReminders": true,
      "paymentConfirmation": true
    }
  },
  "lastLogin": "2026-02-10T10:30:00Z",
  "createdAt": "2026-01-15T08:00:00Z",
  "updatedAt": "2026-02-10T10:30:00Z"
}
```

---

## Estate Model

**Location:** `src/estates/entities/estate.entity.ts`

**Purpose:** Represent a residential community/complex.

### Schema

```typescript
@Schema({ timestamps: true })
export class Estate extends Document {
  @Prop({ required: true })
  name: string; // e.g., "Lekki Gardens Estate"

  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  @Prop({
    type: { type: String, enum: ['Point'], required: true },
    coordinates: [Number],
  })
  location: {
    type: string; // 'Point' for GeoJSON
    coordinates: [number, number]; // [longitude, latitude]
  };

  @Prop()
  totalProperties: number;

  @Prop({ type: [Schema.Types.ObjectId], ref: 'Property' })
  properties: Schema.Types.ObjectId[];

  @Prop()
  totalTenants: number;

  @Prop({ type: [Schema.Types.ObjectId], ref: 'User' })
  administrators: Schema.Types.ObjectId[];

  @Prop()
  amenities: string[]; // ['pool', 'gym', 'security', 'gate']

  @Prop()
  rules: string[]; // Estate regulations

  @Prop()
  logo: string; // Cloudinary URL

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  createdBy: Schema.Types.ObjectId;

  @Prop()
  isActive: boolean;

  @Prop()
  metadata: Record<string, any>;

  @Prop()
  deletedAt?: Date;

  // Timestamps (automatic)
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
```

### Sample Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Lekki Gardens Estate",
  "description": "Premium gated community in Lekki",
  "address": "Lagos, Nigeria",
  "city": "Lagos",
  "state": "Lagos State",
  "zipCode": "100001",
  "location": {
    "type": "Point",
    "coordinates": [3.5449, 6.4281]
  },
  "totalProperties": 150,
  "totalTenants": 450,
  "amenities": ["24/7 Security", "Swimming Pool", "Gym", "Playground"],
  "rules": ["Quiet hours 10pm-7am", "No commercial activities"],
  "administrators": ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"],
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

## Property Model

**Location:** `src/properties/entities/property.entity.ts`

**Purpose:** Represent individual units (apartments, houses) within an estate.

### Schema

```typescript
@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({ required: true, type: Schema.Types.ObjectId, ref: 'Estate' })
  estateId: Schema.Types.ObjectId;

  @Prop({ required: true })
  propertyName: string; // "Block A, Unit 5"

  @Prop({ required: true, enum: ['apartment', 'house', 'townhouse', 'studio'] })
  propertyType: string;

  @Prop()
  address: string;

  @Prop()
  unitNumber: string;

  @Prop()
  floor: number;

  @Prop()
  bedroomCount: number;

  @Prop()
  bathroomCount: number;

  @Prop()
  squareFootage: number;

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  landlordId: Schema.Types.ObjectId;

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  tenantId?: Schema.Types.ObjectId;

  @Prop()
  monthlyRent: number;

  @Prop()
  leaseStartDate: Date;

  @Prop()
  leaseEndDate: Date;

  @Prop({ type: Object })
  metadata: {
    hasParking: boolean;
    hasBalkony: boolean;
    utilities: string[];
    notes: string;
  };

  @Prop()
  isOccupied: boolean;

  @Prop()
  maintenanceHistory: string[];

  @Prop()
  deletedAt?: Date;

  // Timestamps (automatic)
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
```

### Sample Document

```json
{
  "_id": "507f1f77bcf86cd799439017",
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
  "tenantId": "507f1f77bcf86cd799439021",
  "monthlyRent": 500000,
  "leaseStartDate": "2026-01-01T00:00:00Z",
  "leaseEndDate": "2027-01-01T00:00:00Z",
  "metadata": {
    "hasParking": true,
    "hasBalcony": true,
    "utilities": ["water", "electricity", "internet"],
    "notes": "Newly renovated"
  },
  "isOccupied": true,
  "createdAt": "2026-02-10T10:30:00Z"
}
```

---

## Levy Model

**Location:** `src/levies/entities/levy.entity.ts`

**Purpose:** Represent recurring assessments/fees charged to properties.

### Schema

```typescript
@Schema({ timestamps: true })
export class Levy extends Document {
  @Prop({ required: true, type: Schema.Types.ObjectId, ref: 'Estate' })
  estateId: Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string; // "Maintenance Levy - January 2026"

  @Prop()
  description: string;

  @Prop({
    required: true,
    enum: ['maintenance', 'security', 'utilities', 'general', 'other'],
  })
  levyType: string;

  @Prop({ required: true })
  totalAmount: number; // Total levy amount per property

  @Prop({ default: 0 })
  amountPaid: number; // Amount paid so far

  @Prop({ default: false })
  isPaid: boolean; // All paid?

  @Prop()
  dueDate: Date;

  @Prop({ type: [Schema.Types.ObjectId], ref: 'Property' })
  properties: Schema.Types.ObjectId[]; // Which properties this applies to

  @Prop({ type: [Schema.Types.ObjectId], ref: 'User' })
  tenants: Schema.Types.ObjectId[]; // Which tenants owe this

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  createdBy: Schema.Types.ObjectId;

  @Prop()
  reminderSent: boolean;

  @Prop()
  deletedAt?: Date;

  // Timestamps (automatic)
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
```

---

## Payment Model

**Location:** `src/payments/entities/payment.entity.ts`

**Purpose:** Record payment transactions and track verification.

### Schema

```typescript
@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true, type: Schema.Types.ObjectId, ref: 'Levy' })
  levyId: Schema.Types.ObjectId;

  @Prop({ required: true, type: Schema.Types.ObjectId, ref: 'User' })
  userId: Schema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    enum: ['bank_transfer', 'paystack', 'check', 'other'],
  })
  paymentMethod: string;

  @Prop({
    required: true,
    enum: ['pending', 'verified', 'rejected', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop()
  proofOfPayment: string; // Cloudinary URL for receipt image

  @Prop()
  referenceNumber: string; // Transaction ID from bank/Paystack

  @Prop()
  notes: string; // Payer's note

  @Prop()
  verifiedAmount: number; // Amount verified by admin

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  verifiedBy: Schema.Types.ObjectId; // Which admin verified

  @Prop()
  verifiedAt: Date;

  @Prop()
  rejectionReason: string; // Why payment rejected

  @Prop()
  paystackReference?: string; // If online payment

  @Prop()
  paystackAccessCode?: string;

  @Prop()
  deletedAt?: Date;

  // Timestamps (automatic)
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
```

### Sample Document

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "levyId": "507f1f77bcf86cd799439019",
  "userId": "507f1f77bcf86cd799439021",
  "amount": 50000,
  "paymentMethod": "bank_transfer",
  "status": "verified",
  "proofOfPayment": "https://cloudinary.com/image.jpg",
  "referenceNumber": "TXN-2026-001",
  "verifiedAmount": 50000,
  "verifiedBy": "507f1f77bcf86cd799439022",
  "verifiedAt": "2026-02-10T11:00:00Z",
  "createdAt": "2026-02-10T10:30:00Z"
}
```

---

## Audit Log Model

**Location:** `src/audit-logs/entities/audit-log.entity.ts`

**Purpose:** Record every action in the system for compliance and debugging.

### Schema

```typescript
@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true, type: Schema.Types.ObjectId, ref: 'User' })
  userId: Schema.Types.ObjectId;

  @Prop()
  userName: string; // Denormalized for quick display

  @Prop({
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'verify', 'approve', 'reject'],
  })
  action: string;

  @Prop({ required: true })
  entityType: string; // 'user', 'property', 'payment', 'levy', etc.

  @Prop()
  entityId: string; // ID of the affected entity

  @Prop()
  relatedEntityId?: string; // If action affects related entity (e.g., levy for payment)

  @Prop({ type: Object })
  changes: Record<string, any>; // What changed: { propertyName: "Block A", floor: 2 }

  @Prop()
  statusCode: number; // HTTP status: 200, 201, 400, 403, etc.

  @Prop()
  error?: string; // Error message if action failed

  @Prop()
  duration: number; // Processing time in ms

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  // Timestamps (automatic)
  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}
```

---

## Gate Pass Token Model

**Location:** `src/gatePassToken/entities/token.entity.ts`

**Purpose:** Manage visitor access tokens.

### Schema

```typescript
@Schema({ timestamps: true })
export class GatePassToken extends Document {
  @Prop({ required: true })
  token: string; // Unique token: "GT-2026-ABC123XYZ"

  @Prop({ required: true, type: Schema.Types.ObjectId, ref: 'Property' })
  propertyId: Schema.Types.ObjectId;

  @Prop({ required: true, type: Schema.Types.ObjectId, ref: 'User' })
  createdById: Schema.Types.ObjectId; // Resident who generated

  @Prop({ required: true })
  visitorName: string;

  @Prop()
  visitorEmail: string;

  @Prop()
  visitorPhone: string;

  @Prop()
  purpose: string; // "Friend visit", "Delivery", etc.

  @Prop({ required: true })
  expectedArrivalTime: Date;

  @Prop({ required: true })
  expectedDepartureTime: Date;

  @Prop({
    required: true,
    enum: ['active', 'verified', 'revoked', 'expired'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  verifiedBy: Schema.Types.ObjectId; // Security person

  @Prop()
  verifiedAt: Date;

  @Prop()
  revokedAt: Date;

  @Prop()
  revokeReason: string;

  @Prop()
  deletedAt?: Date;

  // Timestamps (automatic)
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
```

---

## Soft Delete Plugin

**Location:** `src/common/database/soft-delete.plugin.ts`

**Purpose:** Prevent hard deletes; mark records as deleted instead.

### Usage

```typescript
// Automatically applied to all models via:
// schema.plugin(softDeletePlugin);

// Soft delete a record
await userModel.updateOne({ _id: userId }, { deletedAt: new Date() });

// Find active (non-deleted) records
const activeUsers = await userModel.find({ deletedAt: { $exists: false } });

// Permanently delete (admin only)
await userModel.findByIdAndRemove(userId); // Hard delete
```

---

## Indexes for Performance

### Recommended MongoDB Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ estateId: 1 });
db.users.createIndex({ primaryRole: 1 });
db.users.createIndex({ createdAt: -1 });

// Properties
db.properties.createIndex({ estateId: 1 });
db.properties.createIndex({ landlordId: 1 });
db.properties.createIndex({ tenantId: 1 });

// Payments
db.payments.createIndex({ levyId: 1 });
db.payments.createIndex({ userId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: -1 });

// Levies
db.levies.createIndex({ estateId: 1 });
db.levies.createIndex({ dueDate: 1 });
db.levies.createIndex({ isPaid: 1 });

// Audit Logs
db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ entityType: 1 });
db.auditlogs.createIndex({ timestamp: -1 });
```

---

## Querying Best Practices

### Good Queries

```typescript
// Find active users in an estate
const users = await userModel.find({
  estateId: estateId,
  deletedAt: { $exists: false },
});

// Find pending payments with user info
const payments = await paymentModel
  .find({ status: 'pending' })
  .populate('userId', ['firstName', 'lastName', 'email'])
  .populate('levyId', ['name', 'totalAmount']);

// Count unpaid levies per estate
const summary = await levyModel.aggregate([
  { $match: { isPaid: false, deletedAt: { $exists: false } } },
  { $group: { _id: '$estateId', count: { $sum: 1 } } },
]);
```

### Performance Tips

- Always use `.lean()` for read-only queries (faster)
- `.select()` to fetch only needed fields
- Use `.limit()` and `.skip()` for pagination
- Create indexes on frequently queried fields
- Denormalize what's frequently fetched together (like userName in AuditLogs)

---

**For setup instructions, see:** [docs/setup.md](setup.md)
