import { PropertyType, OccupancyStatus } from '../entities/property.entity';
declare class DocumentDto {
    title: string;
    fileType: string;
    url: string;
    uploadedAt?: Date;
}
export declare class CreatePropertyDto {
    identifier: string;
    type: PropertyType;
    landlordId: string;
    estateId: string;
    tenantId?: string[];
    size?: string;
    bedrooms?: number;
    bathrooms?: number;
    description?: string;
    photos?: string[];
    documents?: DocumentDto[];
    occupancyStatus?: OccupancyStatus;
}
export {};
