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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("../users/entities/user.entity");
const mongoose_2 = require("mongoose");
const mail_service_1 = require("../common/services/mail.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    userModel;
    mailService;
    constructor(usersService, jwtService, userModel, mailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.userModel = userModel;
        this.mailService = mailService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isEmailVerified) {
            const payload = {
                sub: user._id,
                email: user.email,
                roles: user.roles,
            };
            return {
                status: 222,
                message: 'Email not verified',
                verified: false,
                email: user.email,
                access_token: this.jwtService.sign(payload),
            };
        }
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = verificationToken;
        await user.save();
        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }
    async login(loginDto) {
        const result = await this.validateUser(loginDto.email, loginDto.password);
        if (result.status === 222) {
            return result;
        }
        return {
            message: 'Credential Valid',
            status: 200,
        };
    }
    async validateUserEmailLogin(info) {
        const { email, code } = info;
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        const isVerificationCodeValid = code === user.verificationToken;
        if (!isVerificationCodeValid) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        user.lastLogin = new Date();
        user.verificationToken = null;
        await user.save();
        const payload = {
            sub: user._id,
            email: user.email,
            roles: user.roles,
        };
        return {
            user,
            access_token: this.jwtService.sign(payload),
        };
    }
    async validateUserRegistering(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const newUser = new this.userModel({
            ...registerDto,
            roles: [user_entity_1.UserRole.SUPER_ADMIN],
            password: hashedPassword,
            verificationToken,
            isEmailVerified: false,
        });
        const savedUser = await newUser.save();
        const resObj = {
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            phone: savedUser.phone,
            roles: savedUser.roles,
            isActive: savedUser.isActive,
            isEmailVerified: savedUser.isEmailVerified,
            isTemporaryPassword: savedUser.isTemporaryPassword,
            id: savedUser._id,
            permissions: savedUser.permissions,
        };
        return resObj;
    }
    async register(registerDto) {
        const user = await this.validateUserRegistering(registerDto);
        const payload = {
            sub: user._id,
            email: user.email,
            roles: user.roles,
            estate: user.estate,
        };
        return {
            user,
            access_token: this.jwtService.sign(payload),
        };
    }
    async verifyEmail(info) {
        const { email, code } = info;
        const emailExistAndIsNotVerified = await this.userModel
            .findOne({
            email: email,
        })
            .exec();
        if (emailExistAndIsNotVerified?.isEmailVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        const codeCheck = code === emailExistAndIsNotVerified?.verificationToken;
        if (!codeCheck) {
            throw new common_1.BadRequestException('Incorrect Token');
        }
        emailExistAndIsNotVerified.isEmailVerified = true;
        emailExistAndIsNotVerified.verificationToken = null;
        await emailExistAndIsNotVerified.save();
        return {
            message: 'Email Verification Successful',
            status: 200,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        mongoose_2.Model,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map