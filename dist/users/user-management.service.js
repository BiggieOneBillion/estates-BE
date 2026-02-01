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
exports.UserManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("./entities/user.entity");
const mail_service_1 = require("../common/services/mail.service");
const bcrypt = require("bcrypt");
let UserManagementService = class UserManagementService {
    userModel;
    mailService;
    constructor(userModel, mailService) {
        this.userModel = userModel;
        this.mailService = mailService;
    }
    async createAdmin(superAdminId, adminData, estateId) {
        const creator = await this.userModel.findById(superAdminId);
        if (!creator || creator.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only super admins can create admin users');
        }
        let newAdmin;
        if (adminData.existingLandlordId) {
            const landlord = await this.userModel.findById(adminData.existingLandlordId);
            if (!landlord || landlord.primaryRole !== user_entity_1.UserRole.LANDLORD) {
                throw new common_1.BadRequestException('User must be a landlord to be promoted to admin');
            }
            let newAdminUser = await this.userModel.findByIdAndUpdate(adminData.existingLandlordId, {
                primaryRole: user_entity_1.UserRole.ADMIN,
                adminDetails: {
                    position: adminData.position,
                    customPositionTitle: adminData.customPositionTitle,
                    department: adminData.department,
                    positionPermissions: this.getPositionPermissions(adminData.position),
                    additionalPermissions: adminData.additionalPermissions || [],
                    appointedAt: new Date(),
                    appointedBy: superAdminId,
                },
                $push: {
                    roleHistory: {
                        fromRole: user_entity_1.UserRole.LANDLORD,
                        toRole: user_entity_1.UserRole.ADMIN,
                        changedBy: superAdminId,
                        changedAt: new Date(),
                        reason: `Promoted to ${adminData.position}`,
                    },
                },
            }, { new: true });
            newAdmin = newAdminUser;
        }
        else {
            const password = this.generateTemporaryPassword();
            const hashedPassword = await bcrypt.hash(password, 10);
            newAdmin = new this.userModel({
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                email: adminData.email,
                phone: adminData.phone,
                password: hashedPassword,
                primaryRole: user_entity_1.UserRole.ADMIN,
                estateId,
                adminDetails: {
                    position: adminData.position,
                    customPositionTitle: adminData.customPositionTitle,
                    department: adminData.department,
                    positionPermissions: this.getPositionPermissions(adminData.position),
                    additionalPermissions: adminData.additionalPermissions || [],
                    appointedAt: new Date(),
                    appointedBy: superAdminId,
                },
                hierarchy: {
                    createdBy: superAdminId,
                    reportsTo: superAdminId,
                    manages: [],
                    relationshipEstablishedAt: new Date(),
                },
                isTemporaryPassword: true,
            });
            await newAdmin.save();
            await this.mailService.accountCreationEmail({
                to: newAdmin.email,
                name: `${newAdmin.firstName} ${newAdmin.lastName}`,
                password,
            });
        }
        await this.userModel.findByIdAndUpdate(superAdminId, {
            $addToSet: { 'hierarchy.manages': newAdmin._id },
        });
        return newAdmin;
    }
    async createLandlord(creatorId, landlordData, estateId) {
        const creator = await this.userModel.findById(creatorId);
        if (!creator) {
            throw new common_1.BadRequestException('Invalid creator ID');
        }
        const canCreateLandlord = creator.primaryRole === user_entity_1.UserRole.SUPER_ADMIN ||
            (creator.primaryRole === user_entity_1.UserRole.ADMIN &&
                this.hasPermission(creator, 'landlords', 'create'));
        if (!canCreateLandlord) {
            throw new common_1.ForbiddenException('Insufficient permissions to create landlord');
        }
        const password = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newLandlord = new this.userModel({
            firstName: landlordData.firstName,
            lastName: landlordData.lastName,
            email: landlordData.email,
            phone: landlordData.phone,
            password: hashedPassword,
            primaryRole: user_entity_1.UserRole.LANDLORD,
            estateId,
            landlordDetails: {
                ownedProperties: landlordData.ownedProperties || [],
                tenants: [],
                canCreateTenants: landlordData.canCreateTenants ?? true,
                isEligibleForAdmin: true,
            },
            hierarchy: {
                createdBy: creatorId,
                reportsTo: creatorId,
                manages: [],
                relationshipEstablishedAt: new Date(),
            },
            isTemporaryPassword: true,
        });
        await newLandlord.save();
        await this.userModel.findByIdAndUpdate(creatorId, {
            $addToSet: { 'hierarchy.manages': newLandlord._id },
        });
        await this.mailService.accountCreationEmail({
            to: newLandlord.email,
            name: `${newLandlord.firstName} ${newLandlord.lastName}`,
            password,
        });
        return newLandlord;
    }
    async createTenant(landlordId, tenantData, estateId) {
        const landlord = await this.userModel.findById(landlordId);
        if (!landlord) {
            throw new common_1.BadRequestException('Landlord not found');
        }
        if (landlord.primaryRole === user_entity_1.UserRole.LANDLORD && !landlord.landlordDetails?.canCreateTenants) {
            throw new common_1.ForbiddenException('Landlord does not have permission to create tenants');
        }
        const password = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newTenant = new this.userModel({
            firstName: tenantData.firstName,
            lastName: tenantData.lastName,
            email: tenantData.email,
            phone: tenantData.phone,
            password: hashedPassword,
            primaryRole: user_entity_1.UserRole.TENANT,
            estateId,
            tenantDetails: {
                landlordId: landlordId,
                propertyUnit: tenantData.propertyUnit,
                leaseStartDate: tenantData.leaseStartDate,
                leaseEndDate: tenantData.leaseEndDate,
                tenancyStatus: 'active',
            },
            hierarchy: {
                createdBy: landlordId,
                reportsTo: landlordId,
                manages: [],
                relationshipEstablishedAt: new Date(),
            },
            isTemporaryPassword: true,
        });
        await newTenant.save();
        if (landlord.primaryRole === user_entity_1.UserRole.LANDLORD) {
            await this.userModel.findByIdAndUpdate(landlordId, {
                $addToSet: {
                    'hierarchy.manages': newTenant._id,
                    'landlordDetails.tenants': newTenant._id,
                },
            });
        }
        await this.mailService.accountCreationEmail({
            to: newTenant.email,
            name: `${newTenant.firstName} ${newTenant.lastName}`,
            password,
        });
        return newTenant;
    }
    async createUser(creatorId, userData, estateId) {
        const creator = await this.userModel.findById(creatorId);
        if (!creator) {
            throw new common_1.BadRequestException('Invalid creator ID');
        }
        const canCreateUser = creator.primaryRole === user_entity_1.UserRole.SUPER_ADMIN ||
            (creator.primaryRole === user_entity_1.UserRole.ADMIN &&
                this.hasPermission(creator, 'users', 'create'));
        if (!canCreateUser) {
            throw new common_1.ForbiddenException('Insufficient permissions to create user');
        }
        const existingUser = await this.userModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const password = userData.password || this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new this.userModel({
            ...userData,
            password: hashedPassword,
            estateId,
            hierarchy: {
                createdBy: creatorId,
                reportsTo: creatorId,
                manages: [],
                relationshipEstablishedAt: new Date(),
            },
            isTemporaryPassword: !userData.password,
        });
        await newUser.save();
        await this.userModel.findByIdAndUpdate(creatorId, {
            $addToSet: { 'hierarchy.manages': newUser._id },
        });
        if (newUser.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN &&
            newUser.primaryRole !== user_entity_1.UserRole.SITE_ADMIN) {
            await this.mailService.accountCreationEmail({
                to: newUser.email,
                name: `${newUser.firstName} ${newUser.lastName}`,
                password,
            });
        }
        return newUser;
    }
    async createSecurity(creatorId, securityData, estateId) {
        const isSecurityAlready = await this.userModel.findOne({
            primaryRole: user_entity_1.UserRole.SECURITY,
            estateId,
        });
        if (isSecurityAlready) {
            throw new common_1.BadRequestException('Security already exists for this estate');
        }
        const creator = await this.userModel.findById(creatorId);
        if (!creator) {
            throw new common_1.BadRequestException('Invalid creator ID');
        }
        const canCreateSecurity = creator.primaryRole === user_entity_1.UserRole.SUPER_ADMIN ||
            (creator.primaryRole === user_entity_1.UserRole.ADMIN &&
                this.hasPermission(creator, 'security', 'create'));
        if (!canCreateSecurity) {
            throw new common_1.ForbiddenException('Insufficient permissions to create security');
        }
        const password = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newSecurity = new this.userModel({
            firstName: securityData.firstName,
            lastName: securityData.lastName,
            email: securityData.email,
            phone: securityData.phone,
            password: hashedPassword,
            primaryRole: user_entity_1.UserRole.SECURITY,
            estateId,
            securityDetails: {
                supervisorId: creatorId,
            },
            hierarchy: {
                createdBy: creatorId,
                reportsTo: creatorId,
                manages: [],
                relationshipEstablishedAt: new Date(),
            },
            isTemporaryPassword: true,
        });
        await newSecurity.save();
        await this.userModel.findByIdAndUpdate(creatorId, {
            $addToSet: { 'hierarchy.manages': newSecurity._id },
        });
        await this.mailService.accountCreationEmail({
            to: newSecurity.email,
            name: `${newSecurity.firstName} ${newSecurity.lastName}`,
            password,
        });
        return newSecurity;
    }
    async makeLandlordAdmin(superAdminId, landlordId, adminDetails, reason) {
        const superAdmin = await this.userModel.findById(superAdminId);
        if (!superAdmin || superAdmin.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only super admins can grant admin roles');
        }
        const landlord = await this.userModel.findById(landlordId);
        if (!landlord || landlord.primaryRole !== user_entity_1.UserRole.LANDLORD) {
            throw new common_1.BadRequestException('User is not a landlord');
        }
        if (!landlord.landlordDetails?.isEligibleForAdmin) {
            throw new common_1.ForbiddenException('Landlord is not eligible for admin role');
        }
        const currentSecondaryRoles = landlord.secondaryRoles || [];
        const updatedSecondaryRoles = [
            ...new Set([
                ...currentSecondaryRoles.filter((role) => role !== user_entity_1.UserRole.ADMIN),
                user_entity_1.UserRole.LANDLORD,
            ]),
        ];
        const updatedUser = await this.userModel.findByIdAndUpdate(landlordId, {
            primaryRole: user_entity_1.UserRole.ADMIN,
            secondaryRoles: updatedSecondaryRoles,
            $set: { adminDetails },
            $push: {
                roleHistory: {
                    fromRole: user_entity_1.UserRole.LANDLORD,
                    toRole: user_entity_1.UserRole.ADMIN,
                    changedBy: superAdminId,
                    changedAt: new Date(),
                    reason: reason || 'Landlord promoted to admin by super admin',
                },
            },
        }, { new: true });
        return updatedUser;
    }
    async removeAdminRole(superAdminId, adminId, reason) {
        const superAdmin = await this.userModel.findById(superAdminId);
        if (!superAdmin || superAdmin.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only super admins can remove admin roles');
        }
        const admin = await this.userModel.findById(adminId);
        if (!admin || admin.primaryRole !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('User is not an admin');
        }
        const updatedSecondaryRoles = admin.secondaryRoles?.filter((role) => role !== user_entity_1.UserRole.LANDLORD) || [];
        const updatedUser = await this.userModel.findByIdAndUpdate(adminId, {
            primaryRole: user_entity_1.UserRole.LANDLORD,
            secondaryRoles: updatedSecondaryRoles,
            $unset: { adminDetails: 1 },
            $set: {
                landlordDetails: {
                    ownedProperties: [],
                    tenants: [],
                    canCreateTenants: true,
                    isEligibleForAdmin: true,
                },
            },
            $push: {
                roleHistory: {
                    fromRole: user_entity_1.UserRole.ADMIN,
                    toRole: user_entity_1.UserRole.LANDLORD,
                    changedBy: superAdminId,
                    changedAt: new Date(),
                    reason: reason || 'Admin role removed by super admin',
                },
            },
        }, { new: true });
        return updatedUser;
    }
    async grantPermissions(granterId, userId, permissions, reason) {
        const granter = await this.userModel.findById(granterId);
        const user = await this.userModel.findById(userId);
        if (!granter || !user) {
            throw new common_1.BadRequestException('Invalid user IDs');
        }
        if (granter.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN &&
            !this.hasPermission(granter, 'permissions', 'manage')) {
            throw new common_1.ForbiddenException('Insufficient permissions to grant permissions');
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
            $addToSet: { grantedPermissions: { $each: permissions } },
            $push: {
                permissionHistory: {
                    action: 'granted',
                    permissions: permissions,
                    grantedBy: granterId,
                    grantedAt: new Date(),
                    reason: reason,
                },
            },
        }, { new: true });
        return updatedUser;
    }
    hasPermission(user, resource, action) {
        const hasBasePermission = user.basePermissions?.some((p) => p.resource === resource && p.actions.includes(action));
        const hasGrantedPermission = user.grantedPermissions?.some((p) => p.resource === resource && p.actions.includes(action));
        const isDenied = user.deniedPermissions?.some((p) => p.resource === resource && p.actions.includes(action));
        return (hasBasePermission || Boolean(hasGrantedPermission)) && !isDenied;
    }
    getPositionPermissions(position) {
        const positionPermissions = {
            [user_entity_1.AdminPosition.SUPER_ADMIN]: [
                { resource: user_entity_1.ResourceType.PROPERTIES, actions: [user_entity_1.PermissionAction.MANAGE] },
                { resource: user_entity_1.ResourceType.MAINTENANCE, actions: [user_entity_1.PermissionAction.MANAGE] },
            ],
            [user_entity_1.AdminPosition.FACILITY_MANAGER]: [
                { resource: user_entity_1.ResourceType.PROPERTIES, actions: [user_entity_1.PermissionAction.MANAGE] },
                { resource: user_entity_1.ResourceType.MAINTENANCE, actions: [user_entity_1.PermissionAction.MANAGE] },
            ],
            [user_entity_1.AdminPosition.SECURITY_HEAD]: [
                { resource: user_entity_1.ResourceType.SECURITY, actions: [user_entity_1.PermissionAction.MANAGE] },
                { resource: user_entity_1.ResourceType.USERS, actions: [user_entity_1.PermissionAction.READ, user_entity_1.PermissionAction.UPDATE] },
            ],
            [user_entity_1.AdminPosition.FINANCE_MANAGER]: [
                { resource: user_entity_1.ResourceType.FINANCES, actions: [user_entity_1.PermissionAction.MANAGE] },
                { resource: user_entity_1.ResourceType.REPORTS, actions: [user_entity_1.PermissionAction.MANAGE] },
            ],
            [user_entity_1.AdminPosition.TENANT_RELATIONS]: [
                { resource: user_entity_1.ResourceType.TENANTS, actions: [user_entity_1.PermissionAction.READ, user_entity_1.PermissionAction.UPDATE] },
                { resource: user_entity_1.ResourceType.MAINTENANCE, actions: [user_entity_1.PermissionAction.READ, user_entity_1.PermissionAction.ASSIGN] },
            ],
            [user_entity_1.AdminPosition.MAINTENANCE_SUPERVISOR]: [],
            [user_entity_1.AdminPosition.OPERATIONS_MANAGER]: [],
            [user_entity_1.AdminPosition.PROPERTY_MANAGER]: [],
            [user_entity_1.AdminPosition.CUSTOM]: [],
        };
        return positionPermissions[position] || [];
    }
    generateTemporaryPassword() {
        return Math.random().toString(36).slice(-8);
    }
    async getUserHierarchy(userId) {
        const user = await this.userModel
            .findById(userId)
            .populate('hierarchy.createdBy', 'firstName lastName email primaryRole')
            .populate('hierarchy.reportsTo', 'firstName lastName email primaryRole')
            .populate('hierarchy.manages', 'firstName lastName email primaryRole');
        if (!user)
            return null;
        return {
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                role: user.primaryRole,
                email: user.email,
            },
            createdBy: user.hierarchy?.createdBy,
            reportsTo: user.hierarchy?.reportsTo,
            manages: user.hierarchy?.manages || [],
        };
    }
    async getUsersByEstate(estateId, role) {
        const filter = { estateId };
        if (role)
            filter.primaryRole = role;
        return this.userModel
            .find(filter)
            .select('-password -verificationToken -passwordResetToken')
            .populate('hierarchy.createdBy', 'firstName lastName')
            .populate('hierarchy.reportsTo', 'firstName lastName')
            .sort({ createdAt: -1 });
    }
    async updateUserPermissions(userId, permissions) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        let deniedPermissions = [...(user.deniedPermissions || []), ...(permissions.deniedPermissions || [])];
        if (permissions.basePermissions) {
            const mergedBase = [...(user.basePermissions || []), ...permissions.basePermissions];
            user.basePermissions = this.filterOutDeniedPermissions(this.removeDuplicatePermissions(mergedBase), deniedPermissions);
        }
        if (permissions.grantedPermissions) {
            const mergedGranted = [...(user.grantedPermissions || []), ...permissions.grantedPermissions];
            user.grantedPermissions = this.removeDuplicatePermissions(mergedGranted);
        }
        await user.save();
        return user;
    }
    removeDuplicatePermissions(permissions) {
        const uniqueMap = new Map();
        permissions.forEach((permission) => {
            const key = `${permission.resource}-${(permission.actions || []).sort().join(',')}`;
            uniqueMap.set(key, permission);
        });
        return Array.from(uniqueMap.values());
    }
    filterOutDeniedPermissions(permissions, denied) {
        return permissions.filter(p => !denied.some(d => d.resource === p.resource));
    }
};
exports.UserManagementService = UserManagementService;
exports.UserManagementService = UserManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mail_service_1.MailService])
], UserManagementService);
//# sourceMappingURL=user-management.service.js.map