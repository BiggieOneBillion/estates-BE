import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminPosition, User, UserRole } from './entities/user.entity';
import { MailService } from 'src/common/services/mail.service';
export declare class UsersService {
    private readonly userModel;
    private readonly mailService;
    constructor(userModel: Model<User>, mailService: MailService);
    findAll(): Promise<User[]>;
    findByRole(role: UserRole): Promise<User[]>;
    findByAdminPosition(position: AdminPosition): Promise<User[]>;
    findByEstate(estateId: string): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findSecurity(estateId: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
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
