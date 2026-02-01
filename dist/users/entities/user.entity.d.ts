import { Document, Schema as MongooseSchema } from 'mongoose';
export declare enum UserRole {
    SITE_ADMIN = "site_admin",
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    LANDLORD = "landlord",
    TENANT = "tenant",
    SECURITY = "security"
}
export declare enum AdminPosition {
    FACILITY_MANAGER = "facility_manager",
    SECURITY_HEAD = "security_head",
    MAINTENANCE_SUPERVISOR = "maintenance_supervisor",
    FINANCE_MANAGER = "finance_manager",
    OPERATIONS_MANAGER = "operations_manager",
    PROPERTY_MANAGER = "property_manager",
    TENANT_RELATIONS = "tenant_relations",
    CUSTOM = "custom",
    SUPER_ADMIN = "super_admin"
}
export declare enum PermissionAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    MANAGE = "manage",
    APPROVE = "approve",
    ASSIGN = "assign"
}
export declare enum ResourceType {
    USERS = "users",
    TENANTS = "tenants",
    LANDLORDS = "landlords",
    ADMINS = "admins",
    SECURITY = "security",
    PROPERTIES = "properties",
    MAINTENANCE = "maintenance",
    FINANCES = "finances",
    REPORTS = "reports",
    SETTINGS = "settings",
    PERMISSIONS = "permissions"
}
export declare class Permission {
    resource: ResourceType | AdminPosition;
    actions: PermissionAction[];
    conditions?: string[];
}
export declare class AdminDetails {
    position: AdminPosition;
    customPositionTitle?: string;
    department?: string;
    positionPermissions: Permission[];
    additionalPermissions: Permission[];
    appointedAt: Date;
    appointedBy: MongooseSchema.Types.ObjectId;
    notes?: string;
}
export declare class RoleHierarchy {
    createdBy: MongooseSchema.Types.ObjectId;
    reportsTo?: MongooseSchema.Types.ObjectId;
    manages: MongooseSchema.Types.ObjectId[];
    relationshipEstablishedAt: Date;
}
export declare class SecurityDetails {
    badgeNumber?: string;
    shift?: string;
    assignedAreas?: string[];
    supervisorId?: MongooseSchema.Types.ObjectId;
}
export declare class TenantDetails {
    landlordId: MongooseSchema.Types.ObjectId;
    propertyUnit?: string;
    leaseStartDate?: Date;
    leaseEndDate?: Date;
    tenancyStatus: string;
}
export declare class LandlordDetails {
    ownedProperties?: string[];
    tenants?: MongooseSchema.Types.ObjectId[];
    canCreateTenants: boolean;
    isEligibleForAdmin: boolean;
}
export declare class User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    primaryRole: UserRole;
    secondaryRoles?: UserRole[];
    estateId?: MongooseSchema.Types.ObjectId | null;
    isActive: boolean;
    profileImage?: string;
    lastLogin?: Date;
    isEmailVerified: boolean;
    verificationToken?: string | null;
    isTemporaryPassword: boolean;
    canCreateToken: boolean;
    adminDetails?: AdminDetails;
    landlordDetails?: LandlordDetails;
    tenantDetails?: TenantDetails;
    securityDetails?: SecurityDetails;
    hierarchy: RoleHierarchy;
    basePermissions: Permission[];
    grantedPermissions?: Permission[];
    deniedPermissions?: Permission[];
    roleHistory?: {
        fromRole: UserRole;
        toRole: UserRole;
        changedBy: MongooseSchema.Types.ObjectId;
        changedAt: Date;
        reason?: string;
    }[];
    permissionHistory?: {
        action: 'granted' | 'revoked' | 'modified';
        permissions: Permission[];
        grantedBy: MongooseSchema.Types.ObjectId;
        grantedAt: Date;
        reason?: string;
    }[];
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    twoFactorSecret?: string;
    isTwoFactorEnabled: boolean;
    fcmTokens?: string[];
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    tokenVersion: number;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
