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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const update_user_request_dto_1 = require("./dto/request/update-user.request.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_entity_1 = require("./entities/user.entity");
const role_decorator_1 = require("../auth/decorators/role.decorator");
const user_management_service_1 = require("./user-management.service");
const fcm_token_request_dto_1 = require("./dto/request/fcm-token.request.dto");
const create_landlord_request_dto_1 = require("./dto/request/create-landlord.request.dto");
const create_security_request_dto_1 = require("./dto/request/create-security.request.dto");
const create_tenant_request_dto_1 = require("./dto/request/create-tenant.request.dto");
const create_admin_request_dto_1 = require("./dto/request/create-admin.request.dto");
const update_profile_request_dto_1 = require("./dto/request/update-profile.request.dto");
const update_permissions_request_dto_1 = require("./dto/request/update-permissions.request.dto");
const verified_guard_1 = require("../auth/guards/verified.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
let UsersController = class UsersController {
    usersService;
    userManagement;
    constructor(usersService, userManagement) {
        this.usersService = usersService;
        this.userManagement = userManagement;
    }
    async createAdmins(createAdminDto, user) {
        if (createAdminDto.primaryRole !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only create an admin user');
        }
        return this.userManagement.createAdmin(user.userId, {
            firstName: createAdminDto.firstName,
            lastName: createAdminDto.lastName,
            email: createAdminDto.email,
            phone: createAdminDto.phone,
            position: createAdminDto.adminDetails.position,
            customPositionTitle: createAdminDto.adminDetails?.customPositionTitle,
            department: createAdminDto.adminDetails?.department,
            additionalPermissions: createAdminDto.adminDetails?.additionalPermissions,
        });
    }
    async createLandLord(createLandlordDto, userId) {
        if (createLandlordDto.primaryRole !== user_entity_1.UserRole.LANDLORD) {
            throw new common_1.ForbiddenException('You can only create a landlord');
        }
        return this.userManagement.createLandlord(userId, {
            firstName: createLandlordDto.firstName,
            lastName: createLandlordDto.lastName,
            email: createLandlordDto.email,
            phone: createLandlordDto.phone,
            canCreateTenants: createLandlordDto.canCreateTenants,
        });
    }
    async createTenant(createTenantDto, userId) {
        if (createTenantDto.primaryRole !== user_entity_1.UserRole.TENANT) {
            throw new common_1.ForbiddenException('You can only create a tenant');
        }
        const targetLandlordId = createTenantDto.tenantDetails.landlordId;
        return this.userManagement.createTenant(targetLandlordId, {
            firstName: createTenantDto.firstName,
            lastName: createTenantDto.lastName,
            email: createTenantDto.email,
            phone: createTenantDto.phone,
            propertyUnit: createTenantDto.tenantDetails?.propertyUnit,
            leaseStartDate: createTenantDto.tenantDetails?.leaseStartDate
                ? new Date(createTenantDto.tenantDetails.leaseStartDate)
                : undefined,
            leaseEndDate: createTenantDto.tenantDetails?.leaseEndDate
                ? new Date(createTenantDto.tenantDetails.leaseEndDate)
                : undefined,
        });
    }
    async createSecurity(createSecurityDto, userId) {
        return this.userManagement.createSecurity(userId, {
            firstName: createSecurityDto.firstName,
            lastName: createSecurityDto.lastName,
            email: createSecurityDto.email,
            phone: createSecurityDto.phone,
        });
    }
    async findAll(estate) {
        console.log({ estate });
        if (!estate) {
            throw new common_1.ForbiddenException('You must belong to an estate');
        }
        return this.usersService.findByEstate(estate.toString());
    }
    async findOne(id, currentUser) {
        if (id === currentUser.userId) {
            return this.usersService.findOne(id);
        }
        if ([user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SITE_ADMIN].includes(currentUser.roles)) {
            const targetUser = await this.usersService.findOne(id);
            if (currentUser.roles !== user_entity_1.UserRole.SUPER_ADMIN && targetUser.estateId?.toString() !== currentUser.estate?._id?.toString()) {
                throw new common_1.ForbiddenException('Cannot access users from a different estate');
            }
            return targetUser;
        }
        throw new common_1.ForbiddenException('You do not have permission to access this resource');
    }
    update(id, updateUserDto, req) {
        if (id === req.user.userId ||
            req.user.roles === user_entity_1.UserRole.SUPER_ADMIN ||
            req.user.roles === user_entity_1.UserRole.ADMIN) {
            if (req.user.roles === user_entity_1.UserRole.ADMIN) {
                const requiredPermission = req.user.grantedPermissions.filter((permission) => permission.actions.includes(user_entity_1.PermissionAction.UPDATE) &&
                    permission.resource === user_entity_1.ResourceType.USERS);
                if (requiredPermission.length === 0) {
                    throw new common_1.ForbiddenException('You do not have permission to update users');
                }
            }
            return this.usersService.update(id, updateUserDto);
        }
        throw new common_1.ForbiddenException('You do not have permission to update this resource');
    }
    userUpdateOwnProfile(id, updateProfileDto, currentUserId) {
        if (id === currentUserId) {
            return this.usersService.update(id, updateProfileDto);
        }
        throw new common_1.ForbiddenException('You can only update your own profile here');
    }
    async editUser(id, updateUserDto, currentUser) {
        const userToUpdate = await this.usersService.findOne(id);
        if (currentUser.roles !== user_entity_1.UserRole.SUPER_ADMIN && userToUpdate.estateId?.toString() !== currentUser.estate?._id?.toString()) {
            throw new common_1.ForbiddenException('Cannot update users from a different estate');
        }
        return this.usersService.update(id, updateUserDto);
    }
    async updateUserToAdmin(id, currentUserId, body) {
        return this.userManagement.makeLandlordAdmin(currentUserId, id, body);
    }
    async demoteAdminToLandlord(id, currentUserId) {
        return this.userManagement.removeAdminRole(currentUserId, id);
    }
    async remove(id, currentUser) {
        const userToRemove = await this.usersService.findOne(id);
        if (currentUser.roles !== user_entity_1.UserRole.SUPER_ADMIN && userToRemove.estateId?.toString() !== currentUser.estate?._id?.toString()) {
            throw new common_1.ForbiddenException('Cannot delete users from a different estate');
        }
        return this.usersService.remove(id);
    }
    async updatePermissions(userId, updatePermissionsDto, currentUser) {
        const userToUpdate = await this.usersService.findOne(userId);
        if (currentUser.roles !== user_entity_1.UserRole.SUPER_ADMIN && userToUpdate.estateId?.toString() !== currentUser.estate?._id?.toString()) {
            throw new common_1.ForbiddenException('Cannot update permissions for users in a different estate');
        }
        return this.userManagement.updateUserPermissions(userId, updatePermissionsDto.permission);
    }
    async disableTokenGeneration(id, req) {
        const superAdmin = await this.usersService.findOne(req.user.userId);
        if (!superAdmin) {
            throw new common_1.NotFoundException('Super admin not found');
        }
        if (!superAdmin.estateId) {
            throw new common_1.NotFoundException('Super admin does not have an estate');
        }
        const targetUser = await this.usersService.findOne(id);
        if (!targetUser) {
            throw new common_1.NotFoundException('Target user not found');
        }
        if (targetUser.estateId?.toString() !== superAdmin.estateId.toString()) {
            throw new common_1.ForbiddenException('Cannot disable token generation for users from different estates');
        }
        return this.usersService.disableTokenGeneration(id);
    }
    async enableTokenGeneration(id, req) {
        const superAdmin = await this.usersService.findOne(req.user.userId);
        if (!superAdmin) {
            throw new common_1.NotFoundException('Super admin not found');
        }
        if (!superAdmin.estateId) {
            throw new common_1.NotFoundException('Super admin does not have an estate');
        }
        const targetUser = await this.usersService.findOne(id);
        if (!targetUser) {
            throw new common_1.NotFoundException('Target user not found');
        }
        if (targetUser.estateId?.toString() !== superAdmin.estateId.toString()) {
            throw new common_1.ForbiddenException('Cannot enable token generation for users from different estates');
        }
        return this.usersService.enableTokenGeneration(id);
    }
    async registerFcmToken(registerFcmTokenDto, userId) {
        return this.usersService.registerFcmToken(userId, registerFcmTokenDto.fcmToken);
    }
    async removeFcmToken(token, userId) {
        return this.usersService.removeFcmToken(userId, token);
    }
    async updateNotificationPreferences(updatePreferencesDto, userId) {
        return this.usersService.updateNotificationPreferences(userId, updatePreferencesDto);
    }
    async getNotificationPreferences(userId) {
        const user = await this.usersService.findOne(userId);
        return {
            preferences: user.notificationPreferences || { email: true, push: true, sms: false },
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create an admin user',
        description: 'Allows Super Admins or Admins with CREATE_ADMINS permission to create a new admin.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Admin created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: Insufficient permissions' }),
    (0, common_1.Post)('create/admin'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermission)(user_entity_1.ResourceType.ADMINS, user_entity_1.PermissionAction.CREATE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_request_dto_1.CreateAdminRequestDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createAdmins", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create a landlord user',
        description: 'Allows Super Admins or Admins with CREATE_LANDLORDS permission to create a new landlord.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Landlord created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: Insufficient permissions' }),
    (0, common_1.Post)('create/landlord'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermission)(user_entity_1.ResourceType.LANDLORDS, user_entity_1.PermissionAction.CREATE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_landlord_request_dto_1.CreateLandlordRequestDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createLandLord", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create a tenant user',
        description: 'Allows Super Admins, Admins, or Landlords to create a new tenant under them.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tenant created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: Insufficient permissions' }),
    (0, common_1.Post)('create/tenant'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LANDLORD),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_request_dto_1.CreateTenantRequestDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createTenant", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create a security user',
        description: 'Allows Super Admins or Admins with CREATE_USERS permission to create a new security user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Security user created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: Insufficient permissions' }),
    (0, common_1.Post)('create/security'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermission)(user_entity_1.ResourceType.USERS, user_entity_1.PermissionAction.CREATE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_security_request_dto_1.CreateSecurityRequestDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createSecurity", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users in the estate',
        description: 'Allows Super Admins or Admins with READ_USERS permission to view all users in their estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, common_1.Get)('all'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermission)(user_entity_1.ResourceType.USERS, user_entity_1.PermissionAction.READ),
    __param(0, (0, current_user_decorator_1.CurrentUser)('estate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get user by ID',
        description: 'Allows users to view their own profile, or Admins/Super Admins to view users in their estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Full update of a user',
        description: 'Allows Super Admins or Admins with UPDATE_USERS permission to perform a full update on a user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, common_1.Patch)('full-update/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_request_dto_1.UpdateUserRequestDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Update own profile',
        description: 'Allows any authenticated user to update their own basic profile information.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_request_dto_1.UpdateProfileRequestDto, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "userUpdateOwnProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Edit user details',
        description: 'Comprehensive update endpoint for Super Admins/Admins within their estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User edited successfully' }),
    (0, common_1.Put)(':id'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermission)(user_entity_1.ResourceType.USERS, user_entity_1.PermissionAction.UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_request_dto_1.UpdateUserRequestDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "editUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Promote user to Admin',
        description: 'Allows Super Admins to promote a landlord to an admin role.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User promoted successfully' }),
    (0, common_1.Patch)('update/to-admin/:id'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_admin_request_dto_1.CreateAdminDetailsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserToAdmin", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Demote Admin to Landlord',
        description: 'Allows Super Admins to remove admin role from a user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User demoted successfully' }),
    (0, common_1.Patch)('demote/to-landlord/:id'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "demoteAdminToLandlord", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a user',
        description: 'Allows Super Admins to permanently delete a user account.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, common_1.Delete)(':id'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermission)(user_entity_1.ResourceType.USERS, user_entity_1.PermissionAction.DELETE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Update user permissions',
        description: 'Allows Super Admins to granularly update user permissions.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions updated successfully' }),
    (0, common_1.Patch)('permissions/:userId'),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermission)(user_entity_1.ResourceType.ADMINS, user_entity_1.PermissionAction.MANAGE),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_permissions_request_dto_1.UpdatePermissionsRequestDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePermissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Disable token generation',
        description: 'Prevents a user from generating gate pass tokens.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token generation disabled' }),
    (0, common_1.Patch)('disable-token-generation/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "disableTokenGeneration", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Enable token generation',
        description: 'Allows a user to generate gate pass tokens.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token generation enabled' }),
    (0, common_1.Patch)('enable-token-generation/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "enableTokenGeneration", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Register FCM token',
        description: 'Register a Firebase Cloud Messaging token for push notifications',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'FCM token registered successfully' }),
    (0, common_1.Post)('fcm-token'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_token_request_dto_1.RegisterFcmTokenRequestDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "registerFcmToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Remove FCM token',
        description: 'Remove a Firebase Cloud Messaging token (e.g., on logout)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'FCM token removed successfully' }),
    (0, common_1.Delete)('fcm-token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeFcmToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Update notification preferences',
        description: 'Update user notification channel preferences',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences updated successfully' }),
    (0, common_1.Patch)('notification-preferences'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_token_request_dto_1.UpdateNotificationPreferencesRequestDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get notification preferences',
        description: 'Get current user notification preferences',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences retrieved successfully' }),
    (0, common_1.Get)('notification-preferences/me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getNotificationPreferences", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, verified_guard_1.VerifiedGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_management_service_1.UserManagementService])
], UsersController);
//# sourceMappingURL=users.controller.js.map