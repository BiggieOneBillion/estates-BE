import { IsString, IsEnum, IsMongoId, IsOptional, IsNumber, IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType, OccupancyStatus } from '../entities/property.entity';

class DocumentDto {
  @ApiProperty({ example: 'Deed of Assignment', description: 'Document title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type' })
  @IsString()
  fileType: string;

  @ApiProperty({ example: 'https://cdn.example.com/docs/deed.pdf', description: 'File URL' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Upload timestamp' })
  @IsOptional()
  uploadedAt?: Date;
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'BLOCK-A-UNIT-1', description: 'Unique identifier for the property' })
  @IsString()
  identifier: string;

  @ApiProperty({ enum: PropertyType, description: 'Type of property' })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ example: '60f1a5b8e1234567890abcde', description: 'Landlord User ID' })
  @IsMongoId()
  landlordId: string;

  @ApiProperty({ example: '60f1a5b8e1234567890abcde', description: 'Estate ID' })
  @IsMongoId()
  estateId: string;

  @ApiPropertyOptional({ type: [String], description: 'List of tenant User IDs' })
  @IsOptional()
  @IsMongoId({ each: true })
  tenantId?: string[];

  @ApiPropertyOptional({ example: '1200 sqft', description: 'Property size' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ example: 3, description: 'Number of bedrooms' })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ example: 2, description: 'Number of bathrooms' })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional({ example: 'A beautiful 3-bedroom apartment.', description: 'Brief description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'List of photo URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @ApiPropertyOptional({ type: [DocumentDto], description: 'List of property documents' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];

  @ApiPropertyOptional({ enum: OccupancyStatus, description: 'Occupancy status' })
  @IsOptional()
  @IsEnum(OccupancyStatus)
  occupancyStatus?: OccupancyStatus;
}

