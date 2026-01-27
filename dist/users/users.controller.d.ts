import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserManagementService } from './user-management.service';
import { RegisterFcmTokenDto, UpdateNotificationPreferencesDto } from './dto/fcm-token.dto';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { CreateSecurityDto } from './dto/create-security.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateAdminDto, CreateAdminDetailsDto } from './dto/create-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly userManagement;
    constructor(usersService: UsersService, userManagement: UserManagementService);
    createAdmins(createAdminDto: CreateAdminDto, req: any): Promise<User>;
    createLandLord(createLandlordDto: CreateLandlordDto, req: any): Promise<User>;
    createTenant(createTenantDto: CreateTenantDto, req: any): Promise<User>;
    createSecurity(createSecurityDto: CreateSecurityDto, req: any): Promise<User>;
    findAll(req: any): Promise<User[]>;
    findOne(id: string, req: any): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<User>;
    userUpdateOwnProfile(id: string, updateProfileDto: UpdateProfileDto, req: any): Promise<User>;
    editUser(id: string, updateUserDto: UpdateUserDto, req: any): Promise<User>;
    updateUserToAdmin(id: string, req: any, body: CreateAdminDetailsDto): Promise<User>;
    demoteAdminToLandlord(id: string, req: any): Promise<User>;
    remove(id: string): Promise<void>;
    updatePermissions(updatePermissionsDto: UpdatePermissionsDto, req: any): Promise<User>;
    disableTokenGeneration(id: string, req: any): Promise<{
        message: string;
        user: (import("mongoose").Document<unknown, {}, User> & User & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
    enableTokenGeneration(id: string, req: any): Promise<{
        message: string;
        user: (import("mongoose").Document<unknown, {}, User> & User & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
    registerFcmToken(registerFcmTokenDto: RegisterFcmTokenDto, req: any): Promise<User>;
    removeFcmToken(token: string, req: any): Promise<User>;
    updateNotificationPreferences(updatePreferencesDto: UpdateNotificationPreferencesDto, req: any): Promise<User>;
    getNotificationPreferences(req: any): Promise<{
        preferences: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
    }>;
}
