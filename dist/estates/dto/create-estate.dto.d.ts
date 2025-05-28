declare class CoordinatesDto {
    lat?: number;
    lng?: number;
}
declare class LocationDto {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: CoordinatesDto;
}
declare class SupportingDocumentDto {
    filename: string;
    fileType: string;
    url: string;
    uploadedAt?: Date;
}
export declare class CreateEstateDto {
    name: string;
    location: LocationDto;
    supportingDocuments?: SupportingDocumentDto[];
    description?: string;
    logo?: string;
}
export {};
