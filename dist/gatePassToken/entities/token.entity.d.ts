import { Document, Schema as MongooseSchema } from 'mongoose';
export declare enum TokenType {
    GATE_PASS = "gate_pass",
    RESET_PASSWORD = "reset_password",
    EMAIL_VERIFICATION = "email_verification",
    REFRESH = "refresh"
}
export declare enum VisitorType {
    FAMILY = "family",
    FRIEND = "friend",
    SERVICE_PROVIDER = "service_provider",
    DELIVERY = "delivery",
    OTHER = "other"
}
export declare enum MeansOfIdentification {
    DRIVERS_LICENCES = "driversLicence",
    NIN = "nin",
    VOTERS_CARD = "votersCard",
    INTERNATIONAL_PASSPORT = "internationalPassport",
    OTHERS = "others"
}
export declare enum hasUserVerifiedVisitorStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    UNVERIFIED = "unverified"
}
export declare class Token extends Document {
    user: string;
    token: string;
    visitorName: string;
    visitorType: VisitorType;
    numberOfVisitors: number;
    hasCar: boolean;
    verifyVisitor: boolean;
    carPlateNumber?: string;
    carModel?: string;
    carColor?: string;
    purpose?: string;
    estate: string;
    property?: string;
    expiresAt: Date;
    used: boolean;
    meansOfId?: MeansOfIdentification;
    idImgUrl?: string;
    usedAt?: Date;
    hasUserVerifiedVisitor: hasUserVerifiedVisitorStatus;
    verifiedBy?: string;
}
export declare const TokenSchema: MongooseSchema<Token, import("mongoose").Model<Token, any, any, any, Document<unknown, any, Token> & Token & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Token, Document<unknown, {}, import("mongoose").FlatRecord<Token>> & import("mongoose").FlatRecord<Token> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
