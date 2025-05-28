import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Estate } from '../../estates/entities/estate.entity';
export declare enum PropertyType {
    APARTMENT = "apartment",
    DUPLEX = "duplex",
    BUNGALOW = "bungalow",
    COMMERCIAL = "commercial"
}
export declare enum OccupancyStatus {
    VACANT = "vacant",
    OCCUPIED = "occupied"
}
export declare class Property extends Document {
    identifier: string;
    type: PropertyType;
    landlordId: User;
    estateId: Estate;
    tenantId?: User[];
    size?: string;
    bedrooms?: number;
    bathrooms?: number;
    description?: string;
    photos?: string[];
    documents?: {
        title: string;
        fileType: string;
        url: string;
        uploadedAt?: Date;
    }[];
    occupancyStatus: OccupancyStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PropertySchema: MongooseSchema<Property, import("mongoose").Model<Property, any, any, any, Document<unknown, any, Property> & Property & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Property, Document<unknown, {}, import("mongoose").FlatRecord<Property>> & import("mongoose").FlatRecord<Property> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
