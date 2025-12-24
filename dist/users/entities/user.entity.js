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
exports.UserSchema = exports.User = exports.LandlordDetails = exports.TenantDetails = exports.SecurityDetails = exports.RoleHierarchy = exports.AdminDetails = exports.Permission = exports.ResourceType = exports.PermissionAction = exports.AdminPosition = exports.UserRole = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var UserRole;
(function (UserRole) {
    UserRole["SITE_ADMIN"] = "site_admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["LANDLORD"] = "landlord";
    UserRole["TENANT"] = "tenant";
    UserRole["SECURITY"] = "security";
})(UserRole || (exports.UserRole = UserRole = {}));
var AdminPosition;
(function (AdminPosition) {
    AdminPosition["FACILITY_MANAGER"] = "facility_manager";
    AdminPosition["SECURITY_HEAD"] = "security_head";
    AdminPosition["MAINTENANCE_SUPERVISOR"] = "maintenance_supervisor";
    AdminPosition["FINANCE_MANAGER"] = "finance_manager";
    AdminPosition["OPERATIONS_MANAGER"] = "operations_manager";
    AdminPosition["PROPERTY_MANAGER"] = "property_manager";
    AdminPosition["TENANT_RELATIONS"] = "tenant_relations";
    AdminPosition["CUSTOM"] = "custom";
})(AdminPosition || (exports.AdminPosition = AdminPosition = {}));
var PermissionAction;
(function (PermissionAction) {
    PermissionAction["CREATE"] = "create";
    PermissionAction["READ"] = "read";
    PermissionAction["UPDATE"] = "update";
    PermissionAction["DELETE"] = "delete";
    PermissionAction["MANAGE"] = "manage";
    PermissionAction["APPROVE"] = "approve";
    PermissionAction["ASSIGN"] = "assign";
})(PermissionAction || (exports.PermissionAction = PermissionAction = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["USERS"] = "users";
    ResourceType["TENANTS"] = "tenants";
    ResourceType["LANDLORDS"] = "landlords";
    ResourceType["ADMINS"] = "admins";
    ResourceType["SECURITY"] = "security";
    ResourceType["PROPERTIES"] = "properties";
    ResourceType["MAINTENANCE"] = "maintenance";
    ResourceType["FINANCES"] = "finances";
    ResourceType["REPORTS"] = "reports";
    ResourceType["SETTINGS"] = "settings";
    ResourceType["PERMISSIONS"] = "permissions";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
let Permission = class Permission {
    resource;
    actions;
    conditions;
};
exports.Permission = Permission;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ResourceType }),
    __metadata("design:type", String)
], Permission.prototype, "resource", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: PermissionAction, required: true }),
    __metadata("design:type", Array)
], Permission.prototype, "actions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Permission.prototype, "conditions", void 0);
exports.Permission = Permission = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Permission);
let AdminDetails = class AdminDetails {
    position;
    customPositionTitle;
    department;
    positionPermissions;
    additionalPermissions;
    appointedAt;
    appointedBy;
    notes;
};
exports.AdminDetails = AdminDetails;
__decorate([
    (0, mongoose_1.Prop)({ enum: AdminPosition, required: true }),
    __metadata("design:type", String)
], AdminDetails.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AdminDetails.prototype, "customPositionTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AdminDetails.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Permission] }),
    __metadata("design:type", Array)
], AdminDetails.prototype, "positionPermissions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Permission] }),
    __metadata("design:type", Array)
], AdminDetails.prototype, "additionalPermissions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], AdminDetails.prototype, "appointedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], AdminDetails.prototype, "appointedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AdminDetails.prototype, "notes", void 0);
exports.AdminDetails = AdminDetails = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AdminDetails);
let RoleHierarchy = class RoleHierarchy {
    createdBy;
    reportsTo;
    manages;
    relationshipEstablishedAt;
};
exports.RoleHierarchy = RoleHierarchy;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        default: function () {
            return this.primaryRole === UserRole.SUPER_ADMIN ? this._id : undefined;
        },
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], RoleHierarchy.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        default: function () {
            return this.primaryRole === UserRole.SUPER_ADMIN ? null : undefined;
        },
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], RoleHierarchy.prototype, "reportsTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Schema.Types.ObjectId],
        ref: 'User',
        default: function () {
            return [];
        },
    }),
    __metadata("design:type", Array)
], RoleHierarchy.prototype, "manages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], RoleHierarchy.prototype, "relationshipEstablishedAt", void 0);
exports.RoleHierarchy = RoleHierarchy = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], RoleHierarchy);
let SecurityDetails = class SecurityDetails {
    badgeNumber;
    shift;
    assignedAreas;
    supervisorId;
};
exports.SecurityDetails = SecurityDetails;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SecurityDetails.prototype, "badgeNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SecurityDetails.prototype, "shift", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], SecurityDetails.prototype, "assignedAreas", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], SecurityDetails.prototype, "supervisorId", void 0);
exports.SecurityDetails = SecurityDetails = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SecurityDetails);
let TenantDetails = class TenantDetails {
    landlordId;
    propertyUnit;
    leaseStartDate;
    leaseEndDate;
    tenancyStatus;
};
exports.TenantDetails = TenantDetails;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], TenantDetails.prototype, "landlordId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TenantDetails.prototype, "propertyUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], TenantDetails.prototype, "leaseStartDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], TenantDetails.prototype, "leaseEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active' }),
    __metadata("design:type", String)
], TenantDetails.prototype, "tenancyStatus", void 0);
exports.TenantDetails = TenantDetails = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], TenantDetails);
let LandlordDetails = class LandlordDetails {
    ownedProperties;
    tenants;
    canCreateTenants;
    isEligibleForAdmin;
};
exports.LandlordDetails = LandlordDetails;
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], LandlordDetails.prototype, "ownedProperties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Schema.Types.ObjectId], ref: 'User' }),
    __metadata("design:type", Array)
], LandlordDetails.prototype, "tenants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], LandlordDetails.prototype, "canCreateTenants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], LandlordDetails.prototype, "isEligibleForAdmin", void 0);
exports.LandlordDetails = LandlordDetails = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], LandlordDetails);
let User = class User extends mongoose_2.Document {
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
    lastLogin;
    isEmailVerified;
    verificationToken;
    isTemporaryPassword;
    canCreateToken;
    adminDetails;
    landlordDetails;
    tenantDetails;
    securityDetails;
    hierarchy;
    basePermissions;
    grantedPermissions;
    deniedPermissions;
    roleHistory;
    permissionHistory;
    passwordResetToken;
    passwordResetExpires;
    twoFactorSecret;
    isTwoFactorEnabled;
    notes;
    metadata;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: UserRole, required: true }),
    __metadata("design:type", String)
], User.prototype, "primaryRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: UserRole }),
    __metadata("design:type", Array)
], User.prototype, "secondaryRoles", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Estate',
        required: function () {
            return this.primaryRole !== UserRole.SUPER_ADMIN;
        },
        default: function () {
            return this.primaryRole !== UserRole.SUPER_ADMIN ? undefined : null;
        },
    }),
    __metadata("design:type", Object)
], User.prototype, "estateId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], User.prototype, "verificationToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: function () {
            return this.primaryRole !== UserRole.SUPER_ADMIN;
        },
    }),
    __metadata("design:type", Boolean)
], User.prototype, "isTemporaryPassword", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: function () {
            return this.primaryRole !== UserRole.SECURITY;
        },
    }),
    __metadata("design:type", Boolean)
], User.prototype, "canCreateToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: AdminDetails }),
    __metadata("design:type", AdminDetails)
], User.prototype, "adminDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: LandlordDetails }),
    __metadata("design:type", LandlordDetails)
], User.prototype, "landlordDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: TenantDetails }),
    __metadata("design:type", TenantDetails)
], User.prototype, "tenantDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: SecurityDetails }),
    __metadata("design:type", SecurityDetails)
], User.prototype, "securityDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: RoleHierarchy,
        default: function () {
            if (this.primaryRole === UserRole.SUPER_ADMIN) {
                return {
                    createdBy: null,
                    reportsTo: null,
                    manages: [],
                    relationshipEstablishedAt: new Date(),
                };
            }
            return {};
        },
    }),
    __metadata("design:type", RoleHierarchy)
], User.prototype, "hierarchy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Permission] }),
    __metadata("design:type", Array)
], User.prototype, "basePermissions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Permission] }),
    __metadata("design:type", Array)
], User.prototype, "grantedPermissions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Permission] }),
    __metadata("design:type", Array)
], User.prototype, "deniedPermissions", void 0);
__decorate([
    (0, mongoose_1.Prop)([
        {
            fromRole: { type: String, enum: UserRole },
            toRole: { type: String, enum: UserRole },
            changedBy: { type: mongoose_2.Schema.Types.ObjectId, ref: 'User' },
            changedAt: { type: Date, default: Date.now },
            reason: String,
        },
    ]),
    __metadata("design:type", Array)
], User.prototype, "roleHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)([
        {
            action: { type: String, enum: ['granted', 'revoked', 'modified'] },
            permissions: [
                {
                    resource: {
                        type: String,
                        enum: Object.values(ResourceType),
                        required: true,
                    },
                    actions: {
                        type: [String],
                        enum: Object.values(PermissionAction),
                        required: true,
                    },
                    conditions: { type: [String] },
                },
            ],
            grantedBy: { type: mongoose_2.Schema.Types.ObjectId, ref: 'User' },
            grantedAt: { type: Date, default: Date.now },
            reason: String,
        },
    ]),
    __metadata("design:type", Array)
], User.prototype, "permissionHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "passwordResetToken", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "twoFactorSecret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isTwoFactorEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], User.prototype, "metadata", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ email: 1 });
exports.UserSchema.index({ estateId: 1, primaryRole: 1 });
exports.UserSchema.index({ 'hierarchy.createdBy': 1 });
exports.UserSchema.index({ 'hierarchy.reportsTo': 1 });
exports.UserSchema.index({ 'tenantDetails.landlordId': 1 });
exports.UserSchema.index({ 'landlordDetails.tenants': 1 });
exports.UserSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('primaryRole')) {
        this.basePermissions = getDefaultPermissionsForRole(this.primaryRole);
        this.canCreateToken = this.primaryRole !== UserRole.SECURITY;
    }
    if (this.isNew && this.primaryRole === UserRole.SUPER_ADMIN) {
        if (!this.hierarchy) {
            this.hierarchy = {
                createdBy: this._id,
                reportsTo: undefined,
                manages: [],
                relationshipEstablishedAt: new Date(),
            };
        }
        else {
            if (!this.hierarchy.createdBy) {
                this.hierarchy.createdBy = this
                    ._id;
            }
            if (this.hierarchy.reportsTo === undefined) {
                this.hierarchy.reportsTo = undefined;
            }
            if (!this.hierarchy.manages) {
                this.hierarchy.manages = [];
            }
        }
        if (!this.adminDetails) {
            this.adminDetails = {
                position: AdminPosition.OPERATIONS_MANAGER,
                customPositionTitle: 'Estate Super Administrator',
                department: 'Estate Management',
                positionPermissions: [],
                additionalPermissions: [],
                appointedAt: new Date(),
                appointedBy: this._id,
                notes: 'System-generated super administrator with full estate management privileges',
            };
        }
    }
    next();
});
exports.UserSchema.post('save', async function (doc, next) {
    if (doc.isNew && doc.primaryRole === UserRole.SUPER_ADMIN) {
        if (doc.hierarchy &&
            doc.hierarchy.createdBy &&
            doc.hierarchy.createdBy === doc._id) {
        }
    }
    next();
});
function getDefaultPermissionsForRole(role) {
    const defaultPermissions = {
        [UserRole.SITE_ADMIN]: [
            { resource: ResourceType.USERS, actions: [PermissionAction.MANAGE] },
            { resource: ResourceType.PROPERTIES, actions: [PermissionAction.MANAGE] },
            { resource: ResourceType.SETTINGS, actions: [PermissionAction.MANAGE] },
            {
                resource: ResourceType.PERMISSIONS,
                actions: [PermissionAction.MANAGE],
            },
        ],
        [UserRole.SUPER_ADMIN]: [
            { resource: ResourceType.ADMINS, actions: [PermissionAction.MANAGE] },
            { resource: ResourceType.LANDLORDS, actions: [PermissionAction.MANAGE] },
            { resource: ResourceType.SECURITY, actions: [PermissionAction.MANAGE] },
            { resource: ResourceType.PROPERTIES, actions: [PermissionAction.MANAGE] },
            {
                resource: ResourceType.PERMISSIONS,
                actions: [PermissionAction.MANAGE],
            },
            { resource: ResourceType.TENANTS, actions: [PermissionAction.MANAGE] },
            { resource: ResourceType.FINANCES, actions: [PermissionAction.MANAGE] },
            { resource: ResourceType.REPORTS, actions: [PermissionAction.MANAGE] },
            {
                resource: ResourceType.SETTINGS,
                actions: [PermissionAction.READ, PermissionAction.UPDATE],
            },
        ],
        [UserRole.ADMIN]: [
            {
                resource: ResourceType.PROPERTIES,
                actions: [PermissionAction.READ, PermissionAction.UPDATE],
            },
            {
                resource: ResourceType.REPORTS,
                actions: [PermissionAction.READ, PermissionAction.CREATE],
            },
        ],
        [UserRole.LANDLORD]: [
            {
                resource: ResourceType.TENANTS,
                actions: [PermissionAction.MANAGE],
                conditions: ['own_tenants_only'],
            },
            {
                resource: ResourceType.PROPERTIES,
                actions: [PermissionAction.READ, PermissionAction.UPDATE],
                conditions: ['own_properties_only'],
            },
        ],
        [UserRole.TENANT]: [
            {
                resource: ResourceType.PROPERTIES,
                actions: [PermissionAction.READ],
                conditions: ['assigned_property_only'],
            },
            {
                resource: ResourceType.MAINTENANCE,
                actions: [PermissionAction.CREATE, PermissionAction.READ],
                conditions: ['own_requests_only'],
            },
        ],
        [UserRole.SECURITY]: [
            { resource: ResourceType.PROPERTIES, actions: [PermissionAction.READ] },
            {
                resource: ResourceType.REPORTS,
                actions: [PermissionAction.CREATE, PermissionAction.READ],
                conditions: ['security_reports_only'],
            },
        ],
    };
    return defaultPermissions[role] || [];
}
//# sourceMappingURL=user.entity.js.map