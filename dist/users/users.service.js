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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
const mail_service_1 = require("../common/services/mail.service");
let UsersService = class UsersService {
    userModel;
    mailService;
    constructor(userModel, mailService) {
        this.userModel = userModel;
        this.mailService = mailService;
    }
    async create(createUserDto, creator) {
        const existingUser = await this.userModel.findOne({
            email: createUserDto.email,
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = createUserDto.primaryRole === user_entity_1.UserRole.ADMIN
            ? new this.userModel({
                ...createUserDto,
                password: hashedPassword,
                adminDetails: {
                    ...createUserDto.adminDetails,
                    positionPermissions: this.getPositionPermissions(createUserDto.adminDetails?.position),
                    appointedAt: new Date(),
                    appointedBy: creator,
                    hierarchy: {
                        createdBy: creator,
                        reportsTo: creator,
                        manages: [],
                        relationshipEstablishedAt: new Date(),
                    },
                    isTemporaryPassword: true,
                },
            })
            : new this.userModel({
                ...createUserDto,
                password: hashedPassword,
            });
        if (createUserDto.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN &&
            createUserDto.primaryRole !== user_entity_1.UserRole.SITE_ADMIN) {
            await this.mailService.accountCreationEmail({
                to: createUserDto.email,
                name: createUserDto.firstName,
                password: createUserDto.password,
            });
        }
        return newUser.save();
    }
    getPositionPermissions(position) {
        const positionPermissions = {
            [user_entity_1.AdminPosition.FACILITY_MANAGER]: [
                { resource: 'properties', actions: ['manage'] },
                { resource: 'maintenance', actions: ['manage'] },
            ],
            [user_entity_1.AdminPosition.SECURITY_HEAD]: [
                { resource: 'security', actions: ['manage'] },
                { resource: 'users', actions: ['read', 'update'] },
            ],
            [user_entity_1.AdminPosition.FINANCE_MANAGER]: [
                { resource: 'finances', actions: ['manage'] },
                { resource: 'reports', actions: ['manage'] },
            ],
            [user_entity_1.AdminPosition.TENANT_RELATIONS]: [
                {
                    resource: 'tenants',
                    actions: ['read', 'update'],
                },
                {
                    resource: 'maintenance',
                    actions: ['read', 'assign'],
                },
            ],
            [user_entity_1.AdminPosition.MAINTENANCE_SUPERVISOR]: [
                { resource: 'properties', actions: ['manage'] },
                { resource: 'maintenance', actions: ['manage'] },
            ],
            [user_entity_1.AdminPosition.OPERATIONS_MANAGER]: [
                { resource: 'operations', actions: ['manage'] },
                { resource: 'maintenance', actions: ['manage'] },
            ],
            [user_entity_1.AdminPosition.PROPERTY_MANAGER]: [
                { resource: 'properties', actions: ['manage'] },
                { resource: 'maintenance', actions: ['manage'] },
            ],
            [user_entity_1.AdminPosition.CUSTOM]: [],
        };
        return positionPermissions[position] || [];
    }
    async findAll() {
        return this.userModel.find().exec();
    }
    async findByRole(role) {
        return this.userModel.find({ primaryRole: role }).exec();
    }
    async findByAdminPosition(position) {
        return this.userModel.find({ 'adminDetails.position': position }).exec();
    }
    async findByEstate(estateId) {
        return this.userModel.find({ estateId });
    }
    async findOne(id) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findSecurity(estateId) {
        return this.userModel
            .findOne({ primaryRole: user_entity_1.UserRole.SECURITY, estateId })
            .exec();
    }
    async update(id, updateUserDto) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .exec();
        if (!updatedUser) {
            throw new common_1.BadRequestException(`Could not update user`);
        }
        return updatedUser;
    }
    async remove(id) {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
    }
    async disableTokenGeneration(userId) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, { canCreateToken: false }, { new: true });
        return {
            message: `Token generation disabled for ${updatedUser?.firstName} ${updatedUser?.lastName}`,
            user: updatedUser,
        };
    }
    async enableTokenGeneration(userId) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, { canCreateToken: true }, { new: true });
        return {
            message: `Token generation enabled for ${updatedUser?.firstName} ${updatedUser?.lastName}`,
            user: updatedUser,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mail_service_1.MailService])
], UsersService);
//# sourceMappingURL=users.service.js.map