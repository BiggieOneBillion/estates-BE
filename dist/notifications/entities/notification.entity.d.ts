import { Document, Schema as MongooseSchema } from 'mongoose';
import { SoftDeleteDocument } from 'src/common/database/soft-delete.plugin';
export declare enum NotificationType {
    TOKEN_UPDATED = "token_updated",
    TOKEN_VERIFIED = "token_verified",
    TOKEN_EXPIRED = "token_expired",
    VISITOR_VERIFIED = "visitor_verified",
    VERIFY_VISTOR = "verify_vistor"
}
export declare class Notification extends Document implements SoftDeleteDocument {
    isDeleted: boolean;
    deletedAt?: Date;
    softDelete: () => Promise<this>;
    restore: () => Promise<this>;
    user: string;
    type: NotificationType;
    message: string;
    data: any;
    read: boolean;
    readAt?: Date;
}
export declare const NotificationSchema: MongooseSchema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
