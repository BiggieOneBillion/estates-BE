import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { UpdateUserRequestDto } from './dto/request/update-user.request.dto';
import { AdminPosition, User, UserRole } from './entities/user.entity';
import { UserResponseDto } from './dto/response/user.response.dto';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: SoftDeleteModel<User>);
    findAll(): Promise<User[]>;
    findByRole(role: UserRole): Promise<User[]>;
    findByAdminPosition(position: AdminPosition): Promise<User[]>;
    findByEstate(estateId: string): Promise<UserResponseDto[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findSecurity(estateId: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserRequestDto): Promise<User>;
    remove(id: string): Promise<void>;
    disableTokenGeneration(userId: string): Promise<{
        message: string;
        user: (import("mongoose").Document<unknown, {}, User> & User & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
    enableTokenGeneration(userId: string): Promise<{
        message: string;
        user: (import("mongoose").Document<unknown, {}, User> & User & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
    registerFcmToken(userId: string, fcmToken: string): Promise<User>;
    removeFcmToken(userId: string, fcmToken: string): Promise<User>;
    updateNotificationPreferences(userId: string, preferences: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
    }): Promise<User>;
    findByEstateAndRoles(estateId: string, roles: string[]): Promise<User[]>;
}
