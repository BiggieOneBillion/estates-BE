import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateLandlordDto {
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

  @ApiPropertyOptional({
    type: [String],
    description: 'Property IDs or unit numbers owned',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ownedProperties?: string[];

  @ApiPropertyOptional({ description: 'Can create tenant accounts', default: false })
  @IsOptional()
  @IsBoolean()
  canCreateTenants?: boolean;

  @ApiProperty({ enum: UserRole, example: UserRole.LANDLORD, description: 'Must be LANDLORD role' })
  @IsEnum([UserRole.LANDLORD])
  primaryRole: UserRole.LANDLORD;
}
