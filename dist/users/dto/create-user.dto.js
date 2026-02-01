"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSecurityUserDto = exports.CreateTenantUserDto = exports.CreateLandlordUserDto = exports.CreateAdminUserDto = exports.CreateUserDto = exports.CreateRoleHierarchyDto = exports.CreateLandlordDetailsDto = exports.CreateTenantDetailsDto = exports.CreateSecurityDetailsDto = exports.CreateAdminDetailsDto = exports.CreatePermissionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../entities/user.entity");
class CreatePermissionDto {
    resource;
    actions;
    conditions;
}
exports.CreatePermissionDto = CreatePermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.ResourceType, description: 'Resource type for the permission' }),
    (0, class_validator_1.IsEnum)(user_entity_1.ResourceType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "resource", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        enum: user_entity_1.PermissionAction,
        description: 'Actions allowed on the resource',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsEnum)(user_entity_1.PermissionAction, { each: true }),
    __metadata("design:type", Array)
], CreatePermissionDto.prototype, "actions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'Additional conditions for the permission',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePermissionDto.prototype, "conditions", void 0);
class CreateAdminDetailsDto {
    position;
    customPositionTitle;
    department;
    positionPermissions;
    additionalPermissions;
    appointedBy;
    notes;
}
exports.CreateAdminDetailsDto = CreateAdminDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.AdminPosition, description: 'Admin position' }),
    (0, class_validator_1.IsEnum)(user_entity_1.AdminPosition),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAdminDetailsDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom position title (required if position is CUSTOM)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAdminDetailsDto.prototype, "customPositionTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAdminDetailsDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [CreatePermissionDto],
        description: 'Position-specific permissions',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePermissionDto),
    __metadata("design:type", Array)
], CreateAdminDetailsDto.prototype, "positionPermissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [CreatePermissionDto],
        description: 'Additional permissions granted',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePermissionDto),
    __metadata("design:type", Array)
], CreateAdminDetailsDto.prototype, "additionalPermissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'MongoDB ObjectId of the user who appointed this admin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateAdminDetailsDto.prototype, "appointedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes about this admin role' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateAdminDetailsDto.prototype, "notes", void 0);
class CreateSecurityDetailsDto {
    badgeNumber;
    shift;
    assignedAreas;
    supervisorId;
}
exports.CreateSecurityDetailsDto = CreateSecurityDetailsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Security badge number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateSecurityDetailsDto.prototype, "badgeNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Work shift' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateSecurityDetailsDto.prototype, "shift", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'Areas assigned to this security personnel',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSecurityDetailsDto.prototype, "assignedAreas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'MongoDB ObjectId of supervisor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateSecurityDetailsDto.prototype, "supervisorId", void 0);
class CreateTenantDetailsDto {
    landlordId;
    propertyUnit;
    leaseStartDate;
    leaseEndDate;
    tenancyStatus;
}
exports.CreateTenantDetailsDto = CreateTenantDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MongoDB ObjectId of the landlord' }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTenantDetailsDto.prototype, "landlordId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Property unit identifier' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTenantDetailsDto.prototype, "propertyUnit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lease start date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTenantDetailsDto.prototype, "leaseStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lease end date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTenantDetailsDto.prototype, "leaseEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tenancy status', default: 'active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateTenantDetailsDto.prototype, "tenancyStatus", void 0);
class CreateLandlordDetailsDto {
    ownedProperties;
    tenants;
    canCreateTenants;
    isEligibleForAdmin;
}
exports.CreateLandlordDetailsDto = CreateLandlordDetailsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'Property IDs or unit numbers owned',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateLandlordDetailsDto.prototype, "ownedProperties", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'MongoDB ObjectIds of tenants under this landlord',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateLandlordDetailsDto.prototype, "tenants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Can create tenant accounts', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLandlordDetailsDto.prototype, "canCreateTenants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Eligible for admin promotion', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLandlordDetailsDto.prototype, "isEligibleForAdmin", void 0);
class CreateRoleHierarchyDto {
    createdBy;
    reportsTo;
    manages;
}
exports.CreateRoleHierarchyDto = CreateRoleHierarchyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'MongoDB ObjectId of the user who created this user (auto-set for SUPER_ADMIN)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateRoleHierarchyDto.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'MongoDB ObjectId of direct supervisor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateRoleHierarchyDto.prototype, "reportsTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'MongoDB ObjectIds of users this person manages',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateRoleHierarchyDto.prototype, "manages", void 0);
class CreateUserDto {
    firstName;
    lastName;
    email;
    password;
    phone;
    primaryRole;
    secondaryRoles;
    estateId;
    isActive;
    profileImage;
    isEmailVerified;
    verificationToken;
    isTemporaryPassword;
    adminDetails;
    landlordDetails;
    tenantDetails;
    securityDetails;
    hierarchy;
    grantedPermissions;
    deniedPermissions;
    isTwoFactorEnabled;
    notes;
    metadata;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User first name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User last name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User email address' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User password (optional, will be generated if not provided)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\+?[\d\s\-\(\)]+$/, { message: 'Invalid phone number format' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.UserRole, description: 'Primary user role' }),
    (0, class_validator_1.IsEnum)(user_entity_1.UserRole),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "primaryRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        enum: user_entity_1.UserRole,
        description: 'Secondary roles for multi-role users',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(user_entity_1.UserRole, { each: true }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "secondaryRoles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MongoDB ObjectId of the estate' }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "estateId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User active status', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Profile image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateUserDto.prototype, "profileImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email verification status', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isEmailVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email verification token' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "verificationToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether password is temporary', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isTemporaryPassword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateAdminDetailsDto, description: 'Admin-specific details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateAdminDetailsDto),
    __metadata("design:type", CreateAdminDetailsDto)
], CreateUserDto.prototype, "adminDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateLandlordDetailsDto, description: 'Landlord-specific details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateLandlordDetailsDto),
    __metadata("design:type", CreateLandlordDetailsDto)
], CreateUserDto.prototype, "landlordDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateTenantDetailsDto, description: 'Tenant-specific details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateTenantDetailsDto),
    __metadata("design:type", CreateTenantDetailsDto)
], CreateUserDto.prototype, "tenantDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateSecurityDetailsDto, description: 'Security-specific details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateSecurityDetailsDto),
    __metadata("design:type", CreateSecurityDetailsDto)
], CreateUserDto.prototype, "securityDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateRoleHierarchyDto, description: 'Role hierarchy information (optional for SUPER_ADMIN)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateRoleHierarchyDto),
    __metadata("design:type", CreateRoleHierarchyDto)
], CreateUserDto.prototype, "hierarchy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [CreatePermissionDto],
        description: 'Additional permissions to grant',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePermissionDto),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "grantedPermissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [CreatePermissionDto],
        description: 'Permissions to explicitly deny',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePermissionDto),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "deniedPermissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Two-factor authentication enabled', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isTwoFactorEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes about the user' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateUserDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata as key-value pairs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateUserDto.prototype, "metadata", void 0);
class CreateAdminUserDto extends CreateUserDto {
}
exports.CreateAdminUserDto = CreateAdminUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.UserRole, description: 'Must be admin role' }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "primaryRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateAdminDetailsDto, description: 'Admin details (auto-generated for SUPER_ADMIN if not provided)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateAdminDetailsDto),
    __metadata("design:type", CreateAdminDetailsDto)
], CreateAdminUserDto.prototype, "adminDetails", void 0);
class CreateLandlordUserDto extends CreateUserDto {
}
exports.CreateLandlordUserDto = CreateLandlordUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.UserRole, description: 'Must be landlord role' }),
    (0, class_validator_1.IsEnum)([user_entity_1.UserRole.LANDLORD]),
    __metadata("design:type", String)
], CreateLandlordUserDto.prototype, "primaryRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateLandlordDetailsDto, description: 'Landlord details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateLandlordDetailsDto),
    __metadata("design:type", CreateLandlordDetailsDto)
], CreateLandlordUserDto.prototype, "landlordDetails", void 0);
class CreateTenantUserDto extends CreateUserDto {
}
exports.CreateTenantUserDto = CreateTenantUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.UserRole, description: 'Must be tenant role' }),
    (0, class_validator_1.IsEnum)([user_entity_1.UserRole.TENANT]),
    __metadata("design:type", String)
], CreateTenantUserDto.prototype, "primaryRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CreateTenantDetailsDto, description: 'Tenant details are required' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateTenantDetailsDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateTenantDetailsDto)
], CreateTenantUserDto.prototype, "tenantDetails", void 0);
class CreateSecurityUserDto extends CreateUserDto {
}
exports.CreateSecurityUserDto = CreateSecurityUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.UserRole, description: 'Must be security role' }),
    (0, class_validator_1.IsEnum)([user_entity_1.UserRole.SECURITY]),
    __metadata("design:type", String)
], CreateSecurityUserDto.prototype, "primaryRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CreateSecurityDetailsDto, description: 'Security details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateSecurityDetailsDto),
    __metadata("design:type", CreateSecurityDetailsDto)
], CreateSecurityUserDto.prototype, "securityDetails", void 0);
//# sourceMappingURL=create-user.dto.js.map