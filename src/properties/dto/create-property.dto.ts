import { IsString, IsEnum, IsMongoId, IsOptional, IsNumber, IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, OccupancyStatus } from '../entities/property.entity';

class DocumentDto {
  @IsString()
  title: string;

  @IsString()
  fileType: string;

  @IsUrl()
  url: string;

  @IsOptional()
  uploadedAt?: Date;
}

export class CreatePropertyDto {
  @IsString()
  identifier: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsMongoId()
  landlordId: string;

  @IsMongoId()
  estateId: string;

  @IsOptional()
  @IsMongoId()
  tenantId?: string[];

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];

  @IsOptional()
  @IsEnum(OccupancyStatus)
  occupancyStatus?: OccupancyStatus;
}
