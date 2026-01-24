import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  IsMongoId,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ArrayNotEmpty,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserRole,
  AdminPosition,
  PermissionAction,
  ResourceType,
} from '../entities/user.entity';

// Permission DTO
export class CreatePermissionDto {
  @ApiProperty({ enum: ResourceType, description: 'Resource type for the permission' })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource: ResourceType | AdminPosition;

  @ApiProperty({
    type: [String],
    enum: PermissionAction,
    description: 'Actions allowed on the resource',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  actions: PermissionAction[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Additional conditions for the permission',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];
}

// Role-specific Details - Moved to specialized DTO files




// Role Hierarchy DTO - Updated to be optional for SUPER_ADMIN
export class CreateRoleHierarchyDto {
  @ApiPropertyOptional({ description: 'MongoDB ObjectId of the user who created this user (auto-set for SUPER_ADMIN)' })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'MongoDB ObjectId of direct supervisor' })
  @IsOptional()
  @IsMongoId()
  reportsTo?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'MongoDB ObjectIds of users this person manages',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  manages?: string[];
}

// Main Create User DTO
export class CreateUserDto {
  // Basic Information
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

  // Role and Estate
  @ApiProperty({ enum: UserRole, description: 'Primary user role' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  primaryRole: UserRole;

  @ApiPropertyOptional({
    type: [String],
    enum: UserRole,
    description: 'Secondary roles for multi-role users',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  secondaryRoles?: UserRole[];

  @ApiProperty({ description: 'MongoDB ObjectId of the estate' })
  @IsMongoId()
  // @IsNotEmpty()
  @IsOptional()
  estateId?: string;

  // Status and Profile
  @ApiPropertyOptional({ description: 'User active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileImage?: string;

  @ApiPropertyOptional({ description: 'Email verification status', default: false })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ description: 'Email verification token' })
  @IsOptional()
  @IsString()
  verificationToken?: string;

  @ApiPropertyOptional({ description: 'Whether password is temporary', default: true })
  @IsOptional()
  @IsBoolean()
  isTemporaryPassword?: boolean;

  // Role-specific Details removed (moved to specialized DTOs)

  // Hierarchy and Permissions
  @ApiPropertyOptional({ type: CreateRoleHierarchyDto, description: 'Role hierarchy information (optional for SUPER_ADMIN)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRoleHierarchyDto)
  hierarchy?: CreateRoleHierarchyDto;

  @ApiPropertyOptional({
    type: [CreatePermissionDto],
    description: 'Additional permissions to grant',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  grantedPermissions?: CreatePermissionDto[];

  @ApiPropertyOptional({
    type: [CreatePermissionDto],
    description: 'Permissions to explicitly deny',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  deniedPermissions?: CreatePermissionDto[];

  // Authentication and Security
  @ApiPropertyOptional({ description: 'Two-factor authentication enabled', default: false })
  @IsOptional()
  @IsBoolean()
  isTwoFactorEnabled?: boolean;

  // Additional Metadata
  @ApiPropertyOptional({ description: 'Additional notes about the user' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Additional metadata as key-value pairs' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
