import { UserRole, AdminPosition, PermissionAction, ResourceType } from '../entities/user.entity';
export declare class CreatePermissionDto {
    resource: ResourceType | AdminPosition;
    actions: PermissionAction[];
    conditions?: string[];
}
export declare class CreateAdminDetailsDto {
    position: AdminPosition;
    customPositionTitle?: string;
    department?: string;
    positionPermissions?: CreatePermissionDto[];
    additionalPermissions?: CreatePermissionDto[];
    appointedBy?: string;
    notes?: string;
}
export declare class CreateSecurityDetailsDto {
    badgeNumber?: string;
    shift?: string;
    assignedAreas?: string[];
    supervisorId?: string;
}
export declare class CreateTenantDetailsDto {
    landlordId: string;
    propertyUnit?: string;
    leaseStartDate?: string;
    leaseEndDate?: string;
    tenancyStatus?: string;
}
export declare class CreateLandlordDetailsDto {
    ownedProperties?: string[];
    tenants?: string[];
    canCreateTenants?: boolean;
    isEligibleForAdmin?: boolean;
}
export declare class CreateRoleHierarchyDto {
    createdBy?: string;
    reportsTo?: string;
    manages?: string[];
}
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone: string;
    primaryRole: UserRole;
    secondaryRoles?: UserRole[];
    estateId?: string;
    isActive?: boolean;
    profileImage?: string;
    isEmailVerified?: boolean;
    verificationToken?: string;
    isTemporaryPassword?: boolean;
    adminDetails?: CreateAdminDetailsDto;
    landlordDetails?: CreateLandlordDetailsDto;
    tenantDetails?: CreateTenantDetailsDto;
    securityDetails?: CreateSecurityDetailsDto;
    hierarchy?: CreateRoleHierarchyDto;
    grantedPermissions?: CreatePermissionDto[];
    deniedPermissions?: CreatePermissionDto[];
    isTwoFactorEnabled?: boolean;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class CreateAdminUserDto extends CreateUserDto {
    primaryRole: UserRole.ADMIN | UserRole.SUPER_ADMIN;
    adminDetails?: CreateAdminDetailsDto;
}
export declare class CreateLandlordUserDto extends CreateUserDto {
    primaryRole: UserRole.LANDLORD;
    landlordDetails?: CreateLandlordDetailsDto;
}
export declare class CreateTenantUserDto extends CreateUserDto {
    primaryRole: UserRole.TENANT;
    tenantDetails: CreateTenantDetailsDto;
}
export declare class CreateSecurityUserDto extends CreateUserDto {
    primaryRole: UserRole.SECURITY;
    securityDetails?: CreateSecurityDetailsDto;
}
