import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, ValidateNested, IsMongoId, MaxLength, IsArray, MinLength, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-user.dto';
import { UserRole, AdminPosition } from '../entities/user.entity';

export class CreateAdminDetailsDto {
  @ApiProperty({ enum: AdminPosition, description: 'Admin position' })
  @IsEnum(AdminPosition)
  @IsNotEmpty()
  position: AdminPosition;

  @ApiPropertyOptional({ description: 'Custom position title (required if position is CUSTOM)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customPositionTitle?: string;

  @ApiPropertyOptional({ description: 'Department name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    type: [CreatePermissionDto],
    description: 'Position-specific permissions',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  positionPermissions?: CreatePermissionDto[];

  @ApiPropertyOptional({
    type: [CreatePermissionDto],
    description: 'Additional permissions granted',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  additionalPermissions?: CreatePermissionDto[];

  @ApiPropertyOptional({ description: 'MongoDB ObjectId of the user who appointed this admin' })
  @IsOptional()
  @IsMongoId()
  appointedBy?: string;

  @ApiPropertyOptional({ description: 'Notes about this admin role' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateAdminDto {
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

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN, description: 'Must be ADMIN role' })
  @IsEnum([UserRole.ADMIN])
  primaryRole: UserRole.ADMIN;

  @ApiPropertyOptional({ type: CreateAdminDetailsDto, description: 'Admin details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminDetailsDto)
  adminDetails?: CreateAdminDetailsDto;
}
