import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, ValidateNested, IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionPlan, SubscriptionStatus } from '../entities/estate.entity';

class CoordinatesDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}

class LocationDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

class SubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}

class SupportingDocumentDto {
  @IsString()
  filename: string;

  @IsString()
  fileType: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  uploadedAt?: Date;
}

export class CreateEstateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  // @ValidateNested()
  // @Type(() => SubscriptionDto)
  // subscription: SubscriptionDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SupportingDocumentDto)
  supportingDocuments?: SupportingDocumentDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}