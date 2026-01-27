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
    async registerFcmToken(userId, fcmToken) {
        const user = await this.findOne(userId);
        if (!user.fcmTokens) {
            user.fcmTokens = [];
        }
        if (!user.fcmTokens.includes(fcmToken)) {
            user.fcmTokens.push(fcmToken);
            await user.save();
        }
        return user;
    }
    async removeFcmToken(userId, fcmToken) {
        const user = await this.findOne(userId);
        if (user.fcmTokens) {
            user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken);
            await user.save();
        }
        return user;
    }
    async updateNotificationPreferences(userId, preferences) {
        const user = await this.findOne(userId);
        const currentPrefs = user.notificationPreferences || { email: true, push: true, sms: false };
        user.notificationPreferences = {
            email: preferences.email !== undefined ? preferences.email : currentPrefs.email,
            push: preferences.push !== undefined ? preferences.push : currentPrefs.push,
            sms: preferences.sms !== undefined ? preferences.sms : currentPrefs.sms,
        };
        await user.save();
        return user;
    }
    async findByEstateAndRoles(estateId, roles) {
        return this.userModel
            .find({
            estateId,
            primaryRole: { $in: roles },
        })
            .exec();
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