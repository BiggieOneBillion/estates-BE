import { UsersService } from './users.service';
import { UpdateUserRequestDto } from './dto/request/update-user.request.dto';
import { User } from './entities/user.entity';
import { UserManagementService } from './user-management.service';
import { RegisterFcmTokenRequestDto, UpdateNotificationPreferencesRequestDto } from './dto/request/fcm-token.request.dto';
import { CreateLandlordRequestDto } from './dto/request/create-landlord.request.dto';
import { CreateSecurityRequestDto } from './dto/request/create-security.request.dto';
import { CreateTenantRequestDto } from './dto/request/create-tenant.request.dto';
import { CreateAdminRequestDto, CreateAdminDetailsDto } from './dto/request/create-admin.request.dto';
import { UpdateProfileRequestDto } from './dto/request/update-profile.request.dto';
import { UpdatePermissionsRequestDto } from './dto/request/update-permissions.request.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly userManagement;
    constructor(usersService: UsersService, userManagement: UserManagementService);
    createAdmins(createAdminDto: CreateAdminRequestDto, user: any): Promise<User>;
    createLandLord(createLandlordDto: CreateLandlordRequestDto, userId: string): Promise<User>;
    createTenant(createTenantDto: CreateTenantRequestDto, userId: string): Promise<User>;
    createSecurity(createSecurityDto: CreateSecurityRequestDto, userId: string): Promise<User>;
    findAll(estate: string): Promise<UserResponseDto[]>;
    findOne(id: string, currentUser: any): Promise<User>;
    update(id: string, updateUserDto: UpdateUserRequestDto, req: any): Promise<User>;
    userUpdateOwnProfile(id: string, updateProfileDto: UpdateProfileRequestDto, currentUserId: string): Promise<User>;
    editUser(id: string, updateUserDto: UpdateUserRequestDto, currentUser: any): Promise<User>;
    updateUserToAdmin(id: string, currentUserId: string, body: CreateAdminDetailsDto): Promise<User>;
    demoteAdminToLandlord(id: string, currentUserId: string): Promise<User>;
    remove(id: string, currentUser: any): Promise<void>;
    updatePermissions(userId: string, updatePermissionsDto: UpdatePermissionsRequestDto, currentUser: any): Promise<User>;
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
    registerFcmToken(registerFcmTokenDto: RegisterFcmTokenRequestDto, userId: string): Promise<User>;
    removeFcmToken(token: string, userId: string): Promise<User>;
    updateNotificationPreferences(updatePreferencesDto: UpdateNotificationPreferencesRequestDto, userId: string): Promise<User>;
    getNotificationPreferences(userId: string): Promise<{
        preferences: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
    }>;
}
