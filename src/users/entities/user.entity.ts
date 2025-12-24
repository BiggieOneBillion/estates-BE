// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum UserRole {
  SITE_ADMIN = 'site_admin',
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  SECURITY = 'security',
}

export enum AdminPosition {
  FACILITY_MANAGER = 'facility_manager',
  SECURITY_HEAD = 'security_head',
  MAINTENANCE_SUPERVISOR = 'maintenance_supervisor',
  FINANCE_MANAGER = 'finance_manager',
  OPERATIONS_MANAGER = 'operations_manager',
  PROPERTY_MANAGER = 'property_manager',
  TENANT_RELATIONS = 'tenant_relations',
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

@Schema({ _id: false })
export class Permission {
  @Prop({ required: true, enum: ResourceType })
  resource: ResourceType | AdminPosition;

  @Prop({ type: [String], enum: PermissionAction, required: true })
  actions: PermissionAction[];

  @Prop({ type: [String] })
  conditions?: string[]; // Additional conditions like "own_properties_only"
}

@Schema({ _id: false })
export class AdminDetails {
  @Prop({ enum: AdminPosition, required: true })
  position: AdminPosition;

  @Prop()
  customPositionTitle?: string; // For CUSTOM position type

  @Prop()
  department?: string;

  @Prop({ type: [Permission] })
  positionPermissions: Permission[]; // Permissions specific to this position

  @Prop({ type: [Permission] })
  additionalPermissions: Permission[]; // Extra permissions granted by super_admin

  @Prop({ default: Date.now })
  appointedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  appointedBy: MongooseSchema.Types.ObjectId;

  @Prop()
  notes?: string; // Any special notes about this admin role
}

@Schema({ _id: false })
export class RoleHierarchy {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: function () {
      // For SUPER_ADMIN, set createdBy to their own ID after creation
      // This will be handled in the pre-save middleware
      return this.primaryRole === UserRole.SUPER_ADMIN ? this._id : undefined;
    },
  })
  createdBy: MongooseSchema.Types.ObjectId; // Who created this user

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: function () {
      // SUPER_ADMIN typically doesn't report to anyone (top of hierarchy)
      return this.primaryRole === UserRole.SUPER_ADMIN ? null : undefined;
    },
  })
  reportsTo?: MongooseSchema.Types.ObjectId; // Direct supervisor

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'User',
    default: function () {
      // Initialize empty array for all users
      return [];
    },
  })
  manages: MongooseSchema.Types.ObjectId[]; // Users this person manages

  @Prop({ default: Date.now })
  relationshipEstablishedAt: Date;
}

@Schema({ _id: false })
export class SecurityDetails {
  @Prop()
  badgeNumber?: string;

  @Prop()
  shift?: string; // morning, afternoon, night

  @Prop({ type: [String] })
  assignedAreas?: string[]; // Areas they're responsible for

  @Prop()
  supervisorId?: MongooseSchema.Types.ObjectId;
}

@Schema({ _id: false })
export class TenantDetails {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  landlordId: MongooseSchema.Types.ObjectId;

  @Prop()
  propertyUnit?: string;

  @Prop()
  leaseStartDate?: Date;

  @Prop()
  leaseEndDate?: Date;

  @Prop({ default: 'active' })
  tenancyStatus: string; // active, terminated, pending
}

@Schema({ _id: false })
export class LandlordDetails {
  @Prop({ type: [String] })
  ownedProperties?: string[]; // Property IDs or unit numbers

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User' })
  tenants?: MongooseSchema.Types.ObjectId[]; // Direct tenants under this landlord

  @Prop({ default: false })
  canCreateTenants: boolean;

  @Prop({ default: false })
  isEligibleForAdmin: boolean; // Can be promoted to admin
}

@Schema({ timestamps: true })
export class User extends Document {
  // Basic Information
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  // Role and Estate
  @Prop({ type: String, enum: UserRole, required: true })
  primaryRole: UserRole;

  @Prop({ type: [String], enum: UserRole })
  secondaryRoles?: UserRole[]; // For users with multiple roles

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Estate',
    required: function () {
      return this.primaryRole !== UserRole.SUPER_ADMIN;
    },
    default: function () {
      return this.primaryRole !== UserRole.SUPER_ADMIN ? undefined : null;
    },
  })
  estateId?: MongooseSchema.Types.ObjectId | null;

  // Status and Profile
  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  profileImage?: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String })
  verificationToken?: string | null;

  @Prop({
    default: function () {
      return this.primaryRole !== UserRole.SUPER_ADMIN;
    },
  })
  isTemporaryPassword: boolean;

   // Add canCreateToken property
   @Prop({
    default: function () {
      return this.primaryRole !== UserRole.SECURITY;
    },
  })
  canCreateToken: boolean;

  // Role-specific Details
  @Prop({ type: AdminDetails })
  adminDetails?: AdminDetails;

  @Prop({ type: LandlordDetails })
  landlordDetails?: LandlordDetails;

  @Prop({ type: TenantDetails })
  tenantDetails?: TenantDetails;

  @Prop({ type: SecurityDetails })
  securityDetails?: SecurityDetails;

  // Hierarchy and Permissions - Updated with defaults
  @Prop({
    type: RoleHierarchy,
    default: function () {
      if (this.primaryRole === UserRole.SUPER_ADMIN) {
        return {
          createdBy: null, // Will be set to self in pre-save
          reportsTo: null, // SUPER_ADMIN doesn't report to anyone
          manages: [],
          relationshipEstablishedAt: new Date(),
        };
      }
      return {};
    },
  })
  hierarchy: RoleHierarchy;

  @Prop({ type: [Permission] })
  basePermissions: Permission[]; // Role-based permissions

  @Prop({ type: [Permission] })
  grantedPermissions?: Permission[]; // Additional permissions granted by superior

  @Prop({ type: [Permission] })
  deniedPermissions?: Permission[]; // Explicitly denied permissions

  // Role Change History
  @Prop([
    {
      fromRole: { type: String, enum: UserRole },
      toRole: { type: String, enum: UserRole },
      changedBy: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
      changedAt: { type: Date, default: Date.now },
      reason: String,
    },
  ])
  roleHistory?: {
    fromRole: UserRole;
    toRole: UserRole;
    changedBy: MongooseSchema.Types.ObjectId;
    changedAt: Date;
    reason?: string;
  }[];

  // Permission Change History
  @Prop([
    {
      action: { type: String, enum: ['granted', 'revoked', 'modified'] },
      permissions: [
        {
          resource: {
            type: String,
            enum: Object.values(ResourceType),
            required: true,
          },
          actions: {
            type: [String],
            enum: Object.values(PermissionAction),
            required: true,
          },
          conditions: { type: [String] },
        },
      ],
      grantedBy: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
      grantedAt: { type: Date, default: Date.now },
      reason: String,
    },
  ])
  permissionHistory?: {
    action: 'granted' | 'revoked' | 'modified';
    permissions: Permission[];
    grantedBy: MongooseSchema.Types.ObjectId;
    grantedAt: Date;
    reason?: string;
  }[];

  // Authentication and Security
  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  twoFactorSecret?: string;

  @Prop({ default: false })
  isTwoFactorEnabled: boolean;

  // Additional Metadata
  @Prop()
  notes?: string; // Any additional notes about this user

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Flexible field for additional data
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ estateId: 1, primaryRole: 1 });
UserSchema.index({ 'hierarchy.createdBy': 1 });
UserSchema.index({ 'hierarchy.reportsTo': 1 });
UserSchema.index({ 'tenantDetails.landlordId': 1 });
UserSchema.index({ 'landlordDetails.tenants': 1 });

// Enhanced pre-save middleware to handle SUPER_ADMIN hierarchy defaults
UserSchema.pre('save', function (next) {
  // Set default permissions based on role
  if (this.isNew || this.isModified('primaryRole')) {
    this.basePermissions = getDefaultPermissionsForRole(this.primaryRole);

     // Set canCreateToken based on role
     this.canCreateToken = this.primaryRole !== UserRole.SECURITY;
  }

  // Handle SUPER_ADMIN hierarchy defaults
  if (this.isNew && this.primaryRole === UserRole.SUPER_ADMIN) {
    // Initialize hierarchy if not provided
    if (!this.hierarchy) {
      this.hierarchy = {
        createdBy: this._id as unknown as MongooseSchema.Types.ObjectId, // Self-reference for SUPER_ADMIN
        reportsTo: undefined, // SUPER_ADMIN doesn't report to anyone
        manages: [],
        relationshipEstablishedAt: new Date(),
      };
    } else {
      // If hierarchy is provided but createdBy is not set, default to self
      if (!this.hierarchy.createdBy) {
        this.hierarchy.createdBy = this
          ._id as unknown as MongooseSchema.Types.ObjectId;
      }
      // Ensure reportsTo is null for SUPER_ADMIN
      if (this.hierarchy.reportsTo === undefined) {
        this.hierarchy.reportsTo = undefined;
      }
      // Initialize manages array if not provided
      if (!this.hierarchy.manages) {
        this.hierarchy.manages = [];
      }
    }

    // Set default admin details if not provided
    if (!this.adminDetails) {
      this.adminDetails = {
        position: AdminPosition.OPERATIONS_MANAGER,
        customPositionTitle: 'Estate Super Administrator',
        department: 'Estate Management',
        positionPermissions: [],
        additionalPermissions: [],
        appointedAt: new Date(),
        appointedBy: this._id as unknown as MongooseSchema.Types.ObjectId, // Self-appointed for SUPER_ADMIN
        notes:
          'System-generated super administrator with full estate management privileges',
      };
    }
  }

  next();
});

// Post-save middleware to update createdBy reference for SUPER_ADMIN
UserSchema.post('save', async function (doc, next) {
  if (doc.isNew && doc.primaryRole === UserRole.SUPER_ADMIN) {
    // Update createdBy to reference self if it was set to the document ID
    if (
      doc.hierarchy &&
      doc.hierarchy.createdBy &&
      doc.hierarchy.createdBy === doc._id
    ) {
      // The reference is already correct, no need to update
    }
  }
  next();
});

// Helper function to get default permissions for each role
function getDefaultPermissionsForRole(role: UserRole): Permission[] {
  const defaultPermissions: Record<UserRole, Permission[]> = {
    [UserRole.SITE_ADMIN]: [
      { resource: ResourceType.USERS, actions: [PermissionAction.MANAGE] },
      { resource: ResourceType.PROPERTIES, actions: [PermissionAction.MANAGE] },
      { resource: ResourceType.SETTINGS, actions: [PermissionAction.MANAGE] },
      {
        resource: ResourceType.PERMISSIONS,
        actions: [PermissionAction.MANAGE],
      },
    ],
    [UserRole.SUPER_ADMIN]: [
      { resource: ResourceType.ADMINS, actions: [PermissionAction.MANAGE] },
      { resource: ResourceType.LANDLORDS, actions: [PermissionAction.MANAGE] },
      { resource: ResourceType.SECURITY, actions: [PermissionAction.MANAGE] },
      { resource: ResourceType.PROPERTIES, actions: [PermissionAction.MANAGE] },
      {
        resource: ResourceType.PERMISSIONS,
        actions: [PermissionAction.MANAGE],
      },
      { resource: ResourceType.TENANTS, actions: [PermissionAction.MANAGE] },
      { resource: ResourceType.FINANCES, actions: [PermissionAction.MANAGE] },
      { resource: ResourceType.REPORTS, actions: [PermissionAction.MANAGE] },
      {
        resource: ResourceType.SETTINGS,
        actions: [PermissionAction.READ, PermissionAction.UPDATE],
      },
    ],
    [UserRole.ADMIN]: [
      {
        resource: ResourceType.PROPERTIES,
        actions: [PermissionAction.READ, PermissionAction.UPDATE],
      },
      {
        resource: ResourceType.REPORTS,
        actions: [PermissionAction.READ, PermissionAction.CREATE],
      },
    ],
    [UserRole.LANDLORD]: [
      {
        resource: ResourceType.TENANTS,
        actions: [PermissionAction.MANAGE],
        conditions: ['own_tenants_only'],
      },
      {
        resource: ResourceType.PROPERTIES,
        actions: [PermissionAction.READ, PermissionAction.UPDATE],
        conditions: ['own_properties_only'],
      },
    ],
    [UserRole.TENANT]: [
      {
        resource: ResourceType.PROPERTIES,
        actions: [PermissionAction.READ],
        conditions: ['assigned_property_only'],
      },
      {
        resource: ResourceType.MAINTENANCE,
        actions: [PermissionAction.CREATE, PermissionAction.READ],
        conditions: ['own_requests_only'],
      },
    ],
    [UserRole.SECURITY]: [
      { resource: ResourceType.PROPERTIES, actions: [PermissionAction.READ] },
      {
        resource: ResourceType.REPORTS,
        actions: [PermissionAction.CREATE, PermissionAction.READ],
        conditions: ['security_reports_only'],
      },
    ],
  };

  return defaultPermissions[role] || [];
}
