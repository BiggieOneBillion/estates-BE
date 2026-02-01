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

// Admin Details DTO
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

// Security Details DTO
export class CreateSecurityDetailsDto {
  @ApiPropertyOptional({ description: 'Security badge number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  badgeNumber?: string;

  @ApiPropertyOptional({ description: 'Work shift' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shift?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Areas assigned to this security personnel',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedAreas?: string[];

  @ApiPropertyOptional({ description: 'MongoDB ObjectId of supervisor' })
  @IsOptional()
  @IsMongoId()
  supervisorId?: string;
}

// Tenant Details DTO
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

// Landlord Details DTO
export class CreateLandlordDetailsDto {
  @ApiPropertyOptional({
    type: [String],
    description: 'Property IDs or unit numbers owned',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ownedProperties?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'MongoDB ObjectIds of tenants under this landlord',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tenants?: string[];

  @ApiPropertyOptional({ description: 'Can create tenant accounts', default: false })
  @IsOptional()
  @IsBoolean()
  canCreateTenants?: boolean;

  @ApiPropertyOptional({ description: 'Eligible for admin promotion', default: false })
  @IsOptional()
  @IsBoolean()
  isEligibleForAdmin?: boolean;
}

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

  // Role-specific Details
  @ApiPropertyOptional({ type: CreateAdminDetailsDto, description: 'Admin-specific details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminDetailsDto)
  adminDetails?: CreateAdminDetailsDto;

  @ApiPropertyOptional({ type: CreateLandlordDetailsDto, description: 'Landlord-specific details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLandlordDetailsDto)
  landlordDetails?: CreateLandlordDetailsDto;

  @ApiPropertyOptional({ type: CreateTenantDetailsDto, description: 'Tenant-specific details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantDetailsDto)
  tenantDetails?: CreateTenantDetailsDto;

  @ApiPropertyOptional({ type: CreateSecurityDetailsDto, description: 'Security-specific details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSecurityDetailsDto)
  securityDetails?: CreateSecurityDetailsDto;

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

// Specialized DTOs for specific role creation
export class CreateAdminUserDto extends CreateUserDto {
  @ApiProperty({ enum: UserRole, description: 'Must be admin role' })
  // @IsEnum([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  declare primaryRole: UserRole.ADMIN | UserRole.SUPER_ADMIN;

  @ApiPropertyOptional({ type: CreateAdminDetailsDto, description: 'Admin details (auto-generated for SUPER_ADMIN if not provided)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminDetailsDto)
  declare adminDetails?: CreateAdminDetailsDto;
}



export class CreateLandlordUserDto extends CreateUserDto {
  @ApiProperty({ enum: UserRole, description: 'Must be landlord role' })
  @IsEnum([UserRole.LANDLORD])
  declare primaryRole: UserRole.LANDLORD;

  @ApiPropertyOptional({ type: CreateLandlordDetailsDto, description: 'Landlord details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLandlordDetailsDto)
  declare landlordDetails?: CreateLandlordDetailsDto;
}

export class CreateTenantUserDto extends CreateUserDto {
  @ApiProperty({ enum: UserRole, description: 'Must be tenant role' })
  @IsEnum([UserRole.TENANT])
  declare primaryRole: UserRole.TENANT;

  @ApiProperty({ type: CreateTenantDetailsDto, description: 'Tenant details are required' })
  @ValidateNested()
  @Type(() => CreateTenantDetailsDto)
  @IsNotEmpty()
  declare tenantDetails: CreateTenantDetailsDto;
}

export class CreateSecurityUserDto extends CreateUserDto {
  @ApiProperty({ enum: UserRole, description: 'Must be security role' })
  @IsEnum([UserRole.SECURITY])
  declare primaryRole: UserRole.SECURITY;

  @ApiPropertyOptional({ type: CreateSecurityDetailsDto, description: 'Security details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSecurityDetailsDto)
  declare securityDetails?: CreateSecurityDetailsDto;
}