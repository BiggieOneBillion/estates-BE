import { UsersService } from './users.service';
import { CreateAdminDetailsDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permission, User, UserRole } from './entities/user.entity';
import { UserManagementService } from './user-management.service';
export declare class UsersController {
    private readonly usersService;
    private readonly userManagement;
    constructor(usersService: UsersService, userManagement: UserManagementService);
    createAdmins(createUserDto: CreateUserDto, req: any): Promise<User>;
    createLandLord(createUserDto: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        ownedProperties?: string[];
        canCreateTenants?: boolean;
        primaryRole: UserRole;
    }, req: any): Promise<User>;
    createTenant(createUserDto: CreateUserDto, req: any): Promise<User>;
    createSecurity(createUserDto: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }, req: any): Promise<User>;
    createUser(createUserDto: CreateUserDto, req: any): Promise<User>;
    findAll(req: any): Promise<User[]>;
    findOne(id: string, req: any): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<User>;
    userUpdateOwnProfile(id: string, updateUserDto: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        email?: string;
    }, req: any): Promise<User>;
    editUser(id: string, updateUserDto: UpdateUserDto, req: any): Promise<User>;
    updateUserToAdmin(id: string, req: any, body: CreateAdminDetailsDto): Promise<User>;
    demoteAdminToLandlord(id: string, req: any): Promise<User>;
    remove(id: string): Promise<void>;
    updatePermissions(body: {
        permission: {
            basePermissions?: Permission[];
            grantedPermissions?: Permission[];
            deniedPermissions?: Permission[];
        };
        id: string;
    }, req: any): Promise<User>;
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
}
