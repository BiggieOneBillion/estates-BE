import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    roles?: UserRole[];
    estateId: string;
    isActive?: boolean;
    profileImage?: string;
    isTemporaryPassword?: boolean;
}
