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
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_entity_1 = require("./entities/user.entity");
const role_decorator_1 = require("../auth/decorators/role.decorator");
const util_fn_1 = require("../common/utils/util-fn");
const user_management_service_1 = require("./user-management.service");
let UsersController = class UsersController {
    usersService;
    userManagement;
    constructor(usersService, userManagement) {
        this.usersService = usersService;
        this.userManagement = userManagement;
    }
    async createAdmins(createUserDto, req) {
        if (createUserDto.primaryRole !== user_entity_1.UserRole.ADMIN) {
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
        if (!createUserDto.password) {
            createUserDto.password = (0, util_fn_1.generateStrongPassword)();
        }
        return this.usersService.create(createUserDto, userId);
    }
    async createLandLord(createUserDto, req) {
        if (createUserDto.primaryRole !== user_entity_1.UserRole.LANDLORD) {
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
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email: createUserDto.email,
            phone: createUserDto.phone,
            canCreateTenants: createUserDto.canCreateTenants,
        }, user.estateId.toString());
    }
    async createTenant(createUserDto, req) {
        if (createUserDto.primaryRole !== user_entity_1.UserRole.TENANT) {
            throw new common_1.ForbiddenException('You can only create a tenant');
        }
        const { userId, roles } = req.user;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (roles === user_entity_1.UserRole.ADMIN || roles === user_entity_1.UserRole.LANDLORD) {
            if (createUserDto.primaryRole !== user_entity_1.UserRole.TENANT ||
                createUserDto.tenantDetails?.landlordId !== userId) {
                throw new common_1.ForbiddenException('You can only create tenants under you');
            }
        }
        return this.usersService.create(createUserDto, userId);
    }
    async createSecurity(createUserDto, req) {
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
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email: createUserDto.email,
            phone: createUserDto.phone,
        }, user.estateId.toString());
    }
    async createUser(createUserDto, req) {
        if (createUserDto.primaryRole === user_entity_1.UserRole.LANDLORD ||
            createUserDto.primaryRole === user_entity_1.UserRole.TENANT ||
            createUserDto.primaryRole === user_entity_1.UserRole.ADMIN ||
            createUserDto.primaryRole === user_entity_1.UserRole.SUPER_ADMIN ||
            createUserDto.primaryRole === user_entity_1.UserRole.SITE_ADMIN) {
            throw new common_1.ForbiddenException('You can only create a users that are not admins, landlord, or tenant');
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
                permission.resource === user_entity_1.ResourceType.USERS);
            if (requiredPermission.length === 0) {
                throw new common_1.ForbiddenException('You do not have permission to create users');
            }
        }
        return this.usersService.create(createUserDto, userId);
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
    userUpdateOwnProfile(id, updateUserDto, req) {
        if (id === req.user.userId) {
            return this.usersService.update(id, updateUserDto);
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
    async updatePermissions(body, req) {
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
        const userExist = usersFromEstate.find((user) => user.id === body.id);
        if (!userExist) {
            throw new common_1.NotFoundException('User not found, Cannot access user in another estate');
        }
        return this.userManagement.updateUserPermissions(body.id, body.permission);
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
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('create/admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createAdmins", null);
__decorate([
    (0, common_1.Post)('create/landlord'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createLandLord", null);
__decorate([
    (0, common_1.Post)('create/tenant'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LANDLORD),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Post)('create/security'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createSecurity", null);
__decorate([
    (0, common_1.Post)('create/user'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
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
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "userUpdateOwnProfile", null);
__decorate([
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
    (0, common_1.Patch)('update/to-admin/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_user_dto_1.CreateAdminDetailsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserToAdmin", null);
__decorate([
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
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('update/permission/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePermissions", null);
__decorate([
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
    (0, common_1.Patch)('enable-token-generation/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "enableTokenGeneration", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_management_service_1.UserManagementService])
], UsersController);
//# sourceMappingURL=users.controller.js.map