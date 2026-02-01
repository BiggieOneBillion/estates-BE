import { Model } from 'mongoose';
import { User, UserRole, AdminPosition, Permission } from './entities/user.entity';
import { MailService } from 'src/common/services/mail.service';
import { CreateAdminDetailsDto } from './dto/create-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserManagementService {
    private userModel;
    private readonly mailService;
    constructor(userModel: Model<User>, mailService: MailService);
    createAdmin(superAdminId: string, adminData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        position: AdminPosition;
        customPositionTitle?: string;
        department?: string;
        additionalPermissions?: Permission[];
        existingLandlordId?: string;
    }, estateId: string): Promise<User>;
    createLandlord(creatorId: string, landlordData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        ownedProperties?: string[];
        canCreateTenants?: boolean;
    }, estateId: string): Promise<User>;
    createTenant(landlordId: string, tenantData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        propertyUnit?: string;
        leaseStartDate?: Date;
        leaseEndDate?: Date;
    }, estateId: string): Promise<User>;
    createUser(creatorId: string, userData: CreateUserDto, estateId: string): Promise<User>;
    createSecurity(creatorId: string, securityData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }, estateId: string): Promise<User>;
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
