import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, ValidateNested, IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan, SubscriptionStatus } from '../entities/estate.entity';

class CoordinatesDto {
  @ApiPropertyOptional({ example: 6.5244, description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 3.3792, description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  lng?: number;
}

class LocationDto {
  @ApiProperty({ example: '123 Estate Road', description: 'Street address' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'Lagos', description: 'City' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Lagos State', description: 'State or Province' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: 'Nigeria', description: 'Country' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({ type: CoordinatesDto, description: 'Geo coordinates' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

class SubscriptionDto {
  @ApiProperty({ enum: SubscriptionPlan, description: 'Subscription plan type' })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({ description: 'Subscription start date' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiPropertyOptional({ description: 'Subscription end date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({ enum: SubscriptionStatus, description: 'Subscription status' })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}

class SupportingDocumentDto {
  @ApiProperty({ example: 'deed.pdf', description: 'Filename' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type' })
  @IsString()
  fileType: string;

  @ApiProperty({ example: 'https://cdn.example.com/files/deed.pdf', description: 'File URL' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Upload timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  uploadedAt?: Date;
}

export class CreateEstateDto {
  @ApiProperty({ example: 'Greenwood Estate', description: 'Name of the estate' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Location details' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({
    type: [SupportingDocumentDto],
    description: 'List of supporting documents',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SupportingDocumentDto)
  supportingDocuments?: SupportingDocumentDto[];

  @ApiPropertyOptional({ example: 'A serene residential estate.', description: 'Brief description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/estate.png', description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;
}