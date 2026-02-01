import { Model } from 'mongoose';
import { User, UserRole, AdminPosition, Permission } from './entities/user.entity';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { CreateAdminDetailsDto } from './dto/request/create-admin.request.dto';
import { CreateUserRequestDto } from './dto/request/create-user.request.dto';
export declare class UserManagementService {
    private userModel;
    private readonly eventPublisher;
    constructor(userModel: Model<User>, eventPublisher: EventPublisher);
    createAdmin(requesterId: string, adminData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        position: AdminPosition;
        customPositionTitle?: string;
        department?: string;
        additionalPermissions?: Permission[];
        existingLandlordId?: string;
    }): Promise<User>;
    createLandlord(requesterId: string, landlordData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        ownedProperties?: string[];
        canCreateTenants?: boolean;
    }): Promise<User>;
    createTenant(landlordId: string, tenantData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        propertyUnit?: string;
        leaseStartDate?: Date;
        leaseEndDate?: Date;
    }): Promise<User>;
    createUser(requesterId: string, userData: CreateUserRequestDto): Promise<User>;
    createSecurity(requesterId: string, securityData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }): Promise<User>;
    makeLandlordAdmin(superAdminId: string, landlordId: string, adminDetails: CreateAdminDetailsDto, reason?: string): Promise<User>;
    removeAdminRole(superAdminId: string, adminId: string, reason?: string): Promise<User>;
    grantPermissions(granterId: string, userId: string, permissions: Permission[], reason?: string): Promise<User>;
    private hasPermission;
    private getPositionPermissions;
    private generateTemporaryPassword;
    getUserHierarchy(userId: string): Promise<{
        user: {
            id: unknown;
            name: string;
            role: UserRole;
            email: string;
        };
        createdBy: import("mongoose").Schema.Types.ObjectId;
        reportsTo: import("mongoose").Schema.Types.ObjectId | undefined;
        manages: import("mongoose").Schema.Types.ObjectId[];
    } | null>;
    getUsersByEstate(estateId: string, role?: UserRole): Promise<(import("mongoose").Document<unknown, {}, User> & User & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    updateUserPermissions(userId: string, permissions: {
        basePermissions?: Permission[];
        grantedPermissions?: Permission[];
        deniedPermissions?: Permission[];
    }): Promise<User>;
    private removeDuplicatePermissions;
    private filterOutDeniedPermissions;
}
