import { VisitorType } from '../entities/token.entity';
export declare class CreateTokenDto {
    token?: string;
    visitorName: string;
    visitorType?: VisitorType;
    numberOfVisitors?: number;
    hasCar?: boolean;
    carPlateNumber?: string;
    carModel?: string;
    carColor?: string;
    purpose?: string;
    estate: string;
    property?: string;
    meansOfId?: string;
    idImgUrl?: string;
    expiresAt?: Date;
    used?: boolean;
    verifyVisitor?: boolean;
}
