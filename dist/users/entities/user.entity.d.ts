import { Document, Schema as MongooseSchema } from 'mongoose';
export declare enum UserRole {
    SITE_ADMIN = "site_admin",
    SUPER_ADMIN = "super_admin",
    ESTATE_ADMIN = "estate_admin",
    LANDLORD = "landlord",
    TENANT = "tenant",
    SECURITY = "security"
}
export declare class User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    roles: UserRole[];
    estateId: MongooseSchema.Types.ObjectId;
    isActive: boolean;
    profileImage: string;
    lastLogin: Date;
    isEmailVerified: boolean;
    verificationToken: string | null;
    isTemporaryPassword: boolean;
    permissions?: {
        resource: string;
        actions: string[];
    }[];
    passwordResetToken?: string;
    passwordResetExpires?: Date;
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
