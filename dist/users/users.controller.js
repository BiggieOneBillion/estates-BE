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
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_entity_1 = require("./entities/user.entity");
const role_decorator_1 = require("../auth/decorators/role.decorator");
const user_management_service_1 = require("./user-management.service");
const fcm_token_dto_1 = require("./dto/fcm-token.dto");
const create_landlord_dto_1 = require("./dto/create-landlord.dto");
const create_security_dto_1 = require("./dto/create-security.dto");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const update_permissions_dto_1 = require("./dto/update-permissions.dto");
const verified_guard_1 = require("../auth/guards/verified.guard");
let UsersController = class UsersController {
    usersService;
    userManagement;
    constructor(usersService, userManagement) {
        this.usersService = usersService;
        this.userManagement = userManagement;
    }
    async createAdmins(createAdminDto, req) {
        if (createAdminDto.primaryRole !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only create an admin user');
        }
        const { userId, roles } = req.user;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (roles === user_entity_1.UserRole.ADMIN) {
            if (!user.grantedPermissions) {
                throw new common_1.ForbiddenException('You do not have permission to create users');
            }
            const requiredPermission = user.grantedPermissions.filter((permission) => permission.actions.includes(user_entity_1.PermissionAction.CREATE) &&
                permission.resource === user_entity_1.ResourceType.ADMINS);
            if (requiredPermission.length === 0) {
                throw new common_1.ForbiddenException('You do not have permission to create users');
            }
        }
        return this.userManagement.createAdmin(userId, {
            firstName: createAdminDto.firstName,
            lastName: createAdminDto.lastName,
            email: createAdminDto.email,
            phone: createAdminDto.phone,
            position: createAdminDto.adminDetails.position,
            customPositionTitle: createAdminDto.adminDetails?.customPositionTitle,
            department: createAdminDto.adminDetails?.department,
            additionalPermissions: createAdminDto.adminDetails?.additionalPermissions,
        }, user.estateId.toString());
    }
    async createLandLord(createLandlordDto, req) {
        if (createLandlordDto.primaryRole !== user_entity_1.UserRole.LANDLORD) {
            throw new common_1.ForbiddenException('You can only create a landlord');
        }
        const { userId, roles } = req.user;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (roles === user_entity_1.UserRole.ADMIN) {
            if (!user.grantedPermissions) {
                throw new common_1.ForbiddenException('You do not have permission to create users');
            }
            const requiredPermission = user.grantedPermissions.filter((permission) => permission.actions.includes(user_entity_1.PermissionAction.CREATE) &&
                permission.resource === user_entity_1.ResourceType.LANDLORDS);
            if (requiredPermission.length === 0) {
                throw new common_1.ForbiddenException('You do not have permission to create users');
            }
        }
        return this.userManagement.createLandlord(userId, {
            firstName: createLandlordDto.firstName,
            lastName: createLandlordDto.lastName,
            email: createLandlordDto.email,
            phone: createLandlordDto.phone,
            canCreateTenants: createLandlordDto.canCreateTenants,
        }, user.estateId.toString());
    }
    async createTenant(createTenantDto, req) {
        if (createTenantDto.primaryRole !== user_entity_1.UserRole.TENANT) {
            throw new common_1.ForbiddenException('You can only create a tenant');
        }
        const { userId, roles } = req.user;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const targetLandlordId = createTenantDto.tenantDetails.landlordId;
        if (roles === user_entity_1.UserRole.LANDLORD || roles === user_entity_1.UserRole.ADMIN) {
            if (targetLandlordId !== userId && roles !== user_entity_1.UserRole.SUPER_ADMIN) {
                const canCreateForOthers = roles === user_entity_1.UserRole.ADMIN &&
                    user.grantedPermissions?.some(p => p.resource === user_entity_1.ResourceType.USERS && p.actions.includes(user_entity_1.PermissionAction.CREATE));
                if (!canCreateForOthers && targetLandlordId !== userId) {
                    throw new common_1.ForbiddenException('You can only create tenants under your own account');
                }
            }
        }
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
        }, user.estateId.toString());
    }
    async createSecurity(createSecurityDto, req) {
        const { userId, roles } = req.user;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (roles === user_entity_1.UserRole.ADMIN) {
            if (!user.grantedPermissions) {
                throw new common_1.ForbiddenException('You do not have permission to create users');
            }
            const requiredPermission = user.grantedPermissions.filter((permission) => permission.actions.includes(user_entity_1.PermissionAction.CREATE) &&
                permission.resource === user_entity_1.ResourceType.USERS);
            if (requiredPermission.length === 0) {
                throw new common_1.ForbiddenException('You do not have permission to create users');
            }
        }
        return this.userManagement.createSecurity(userId, {
            firstName: createSecurityDto.firstName,
            lastName: createSecurityDto.lastName,
            email: createSecurityDto.email,
            phone: createSecurityDto.phone,
        }, user.estateId.toString());
    }
    async findAll(req) {
        const { userId, roles } = req.user;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user && !user.estateId) {
            throw new common_1.NotFoundException('User does not have an estate');
        }
        if (roles === user_entity_1.UserRole.ADMIN) {
            if (!user.grantedPermissions) {
                throw new common_1.ForbiddenException('You do not have permission to access users data');
            }
            const requiredPermission = user.grantedPermissions.filter((permission) => permission.actions.includes(user_entity_1.PermissionAction.MANAGE) ||
                (permission.actions.includes(user_entity_1.PermissionAction.READ) &&
                    permission.resource === user_entity_1.ResourceType.USERS));
            if (requiredPermission.length === 0) {
                throw new common_1.ForbiddenException('You do not have permission to access users data');
            }
        }
        return this.usersService.findByEstate(user.estateId.toString());
    }
    async findOne(id, req) {
        if (id === req.user.userId ||
            req.user.roles.includes(user_entity_1.UserRole.SUPER_ADMIN) ||
            req.user.roles.includes(user_entity_1.UserRole.ADMIN)) {
            if (req.user.roles === user_entity_1.UserRole.ADMIN) {
                const requiredPermission = req.user.grantedPermissions.filter((permission) => permission.actions.includes(user_entity_1.PermissionAction.READ) &&
                    permission.resource === user_entity_1.ResourceType.USERS);
                if (requiredPermission.length === 0) {
                    throw new common_1.ForbiddenException('Cannot view users details');
                }
            }
            if (req.user.roles === user_entity_1.UserRole.SUPER_ADMIN) {
                const user = await this.usersService.findOne(req.user.userId);
                if (!user) {
                    throw new common_1.NotFoundException('User not found');
                }
                const usersFromEstate = await this.usersService.findByEstate(user.estateId.toString());
                const userExist = usersFromEstate.find((user) => user.id === id);
                if (!userExist) {
                    throw new common_1.NotFoundException('User not found, Cannot access user in another estate');
                }
                return this.usersService.findOne(id);
            }
            return this.usersService.findOne(id);
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
    userUpdateOwnProfile(id, updateProfileDto, req) {
        if (id === req.user.userId) {
            return this.usersService.update(id, updateProfileDto);
        }
        throw new common_1.ForbiddenException('You do not have permission to update this resource');
    }
    async editUser(id, updateUserDto, req) {
        const { userId, roles } = req.user;
        const requester = await this.usersService.findOne(userId);
        if (!requester) {
            throw new common_1.NotFoundException('Requesting user not found.');
        }
        const userToUpdate = await this.usersService.findOne(id);
        if (!userToUpdate) {
            throw new common_1.NotFoundException(`User with ID ${id} not found.`);
        }
        if (requester.estateId?.toString() !== userToUpdate.estateId?.toString()) {
            throw new common_1.ForbiddenException('Cannot update users from a different estate.');
        }
        if (roles === user_entity_1.UserRole.ADMIN &&
            id !== userId &&
            !requester.grantedPermissions?.some((p) => p.resource === user_entity_1.ResourceType.USERS &&
                p.actions.includes(user_entity_1.PermissionAction.UPDATE))) {
            throw new common_1.ForbiddenException('You do not have permission to update other users.');
        }
        return this.usersService.update(id, updateUserDto);
    }
    async updateUserToAdmin(id, req, body) {
        const user = await this.usersService.findOne(req.user.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.estateId) {
            throw new common_1.NotFoundException('User does not have an estate');
        }
        const userInEstate = await this.usersService.findByEstate(user.estateId.toString());
        const userExistInEstate = userInEstate.find((user) => user.id === id);
        if (!userExistInEstate) {
            throw new common_1.NotFoundException('User not found, Cannot access user in another estate');
        }
        return this.userManagement.makeLandlordAdmin(req.user.userId, id, body);
    }
    async demoteAdminToLandlord(id, req) {
        const user = await this.usersService.findOne(req.user.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.estateId) {
            throw new common_1.NotFoundException('User does not have an estate');
        }
        const userInEstate = await this.usersService.findByEstate(user.estateId.toString());
        const userExistInEstate = userInEstate.find((user) => user.id === id);
        if (!userExistInEstate) {
            throw new common_1.NotFoundException('User not found, Cannot access user in another estate');
        }
        return this.userManagement.removeAdminRole(req.user.userId, id);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
    async updatePermissions(updatePermissionsDto, req) {
        const { userId } = req.user;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let usersFromEstate;
        try {
            usersFromEstate = await this.usersService.findByEstate(user.estateId.toString());
        }
        catch {
            throw new common_1.NotFoundException('User does not have an estate');
        }
        const userExist = usersFromEstate.find((user) => user.id === updatePermissionsDto.id);
        if (!userExist) {
            throw new common_1.NotFoundException('User not found, Cannot access user in another estate');
        }
        return this.userManagement.updateUserPermissions(updatePermissionsDto.id, updatePermissionsDto.permission);
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
    async registerFcmToken(registerFcmTokenDto, req) {
        const userId = req.user.userId;
        return this.usersService.registerFcmToken(userId, registerFcmTokenDto.fcmToken);
    }
    async removeFcmToken(token, req) {
        const userId = req.user.userId;
        return this.usersService.removeFcmToken(userId, token);
    }
    async updateNotificationPreferences(updatePreferencesDto, req) {
        const userId = req.user.userId;
        return this.usersService.updateNotificationPreferences(userId, updatePreferencesDto);
    }
    async getNotificationPreferences(req) {
        const userId = req.user.userId;
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
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto, Object]),
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
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_landlord_dto_1.CreateLandlordDto, Object]),
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
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LANDLORD),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto, Object]),
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
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_security_dto_1.CreateSecurityDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createSecurity", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users in the estate',
        description: 'Allows Super Admins or Admins with READ_USERS permission to view all users in their estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
    __param(1, (0, common_1.Request)()),
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
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
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
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "userUpdateOwnProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Edit user details',
        description: 'Comprehensive update endpoint for Super Admins/Admins within their estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User edited successfully' }),
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "editUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Promote user to Admin',
        description: 'Allows Super Admins to promote a landlord to an admin role.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User promoted successfully' }),
    (0, common_1.Patch)('update/to-admin/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_admin_dto_1.CreateAdminDetailsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserToAdmin", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Demote Admin to Landlord',
        description: 'Allows Super Admins to remove admin role from a user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User demoted successfully' }),
    (0, common_1.Patch)('update/demote-admin/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "demoteAdminToLandlord", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a user',
        description: 'Allows Super Admins to permanently delete a user account.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Update user permissions',
        description: 'Allows Super Admins to granularly update user permissions.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions updated successfully' }),
    (0, common_1.Post)('update/permission/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_permissions_dto_1.UpdatePermissionsDto, Object]),
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
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_token_dto_1.RegisterFcmTokenDto, Object]),
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
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
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
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_token_dto_1.UpdateNotificationPreferencesDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get notification preferences',
        description: 'Get current user notification preferences',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences retrieved successfully' }),
    (0, common_1.Get)('notification-preferences/me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getNotificationPreferences", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, verified_guard_1.VerifiedGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_management_service_1.UserManagementService])
], UsersController);
//# sourceMappingURL=users.controller.js.map