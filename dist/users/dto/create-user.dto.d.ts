import { UserRole, AdminPosition, PermissionAction, ResourceType } from '../entities/user.entity';
export declare class CreatePermissionDto {
    resource: ResourceType | AdminPosition;
    actions: PermissionAction[];
    conditions?: string[];
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
    hierarchy?: CreateRoleHierarchyDto;
    grantedPermissions?: CreatePermissionDto[];
    deniedPermissions?: CreatePermissionDto[];
    isTwoFactorEnabled?: boolean;
    notes?: string;
    metadata?: Record<string, any>;
}
