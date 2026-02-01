import { Document, Schema as MongooseSchema } from 'mongoose';
export declare enum SubscriptionPlan {
    MONTHLY = "monthly",
    YEARLY = "yearly",
    FREE = "free"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class Estate extends Document {
    owner?: string;
    name: string;
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates?: {
            lat?: number;
            lng?: number;
        };
    };
    subscription: {
        plan: SubscriptionPlan;
        startDate: Date;
        endDate?: Date;
        status: SubscriptionStatus;
    };
    supportingDocuments?: {
        filename: string;
        fileType: string;
        url: string;
        uploadedAt?: Date;
    }[];
    description: string;
    logo: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const EstateSchema: MongooseSchema<Estate, import("mongoose").Model<Estate, any, any, any, Document<unknown, any, Estate> & Estate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Estate, Document<unknown, {}, import("mongoose").FlatRecord<Estate>> & import("mongoose").FlatRecord<Estate> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
