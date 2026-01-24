import { IsString, IsEmail, IsNotEmpty, IsDateString, IsOptional, IsEnum, ValidateNested, IsMongoId, MaxLength, MinLength, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateTenantDetailsDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the landlord' })
  @IsMongoId()
  @IsNotEmpty()
  landlordId: string;

  @ApiPropertyOptional({ description: 'Property unit identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  propertyUnit?: string;

  @ApiPropertyOptional({ description: 'Lease start date' })
  @IsOptional()
  @IsDateString()
  leaseStartDate?: string;

  @ApiPropertyOptional({ description: 'Lease end date' })
  @IsOptional()
  @IsDateString()
  leaseEndDate?: string;

  @ApiPropertyOptional({ description: 'Tenancy status', default: 'active' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tenancyStatus?: string;
}

export class CreateTenantDto {
  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-\(\)]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TENANT, description: 'Must be TENANT role' })
  @IsEnum([UserRole.TENANT])
  primaryRole: UserRole.TENANT;

  @ApiProperty({ type: CreateTenantDetailsDto, description: 'Tenant details are required' })
  @ValidateNested()
  @Type(() => CreateTenantDetailsDto)
  @IsNotEmpty()
  tenantDetails: CreateTenantDetailsDto;
}
