import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, ValidateNested, MinLength, MaxLength, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { CreateAdminDetailsDto } from './create-admin.dto';

export class CreateSuperAdminDto {
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

  @ApiPropertyOptional({ description: 'User password (optional, will be generated if not provided)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiProperty({ description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-\(\)]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SUPER_ADMIN, description: 'Must be SUPER_ADMIN role' })
  @IsEnum([UserRole.SUPER_ADMIN])
  primaryRole: UserRole.SUPER_ADMIN;

  @ApiPropertyOptional({ type: CreateAdminDetailsDto, description: 'Super Admin details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminDetailsDto)
  adminDetails?: CreateAdminDetailsDto;
}
