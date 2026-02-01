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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("../users/entities/user.entity");
const mongoose_2 = require("mongoose");
const user_response_dto_1 = require("../users/dto/response/user.response.dto");
const class_transformer_1 = require("class-transformer");
const event_publisher_service_1 = require("../common/events/services/event-publisher.service");
const user_events_1 = require("../common/events/domain/user-events");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    userModel;
    eventPublisher;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService, userModel, eventPublisher) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.userModel = userModel;
        this.eventPublisher = eventPublisher;
    }
    async validateUser(email, password, isMobile) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Failed login attempt for email: ${email}`);
            throw new common_1.BadRequestException('Invalid credentials');
        }
        if (!isMobile && user.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN) {
            return {
                message: 'Login through your mobile device',
                status: 400,
            };
        }
        if (!user.isEmailVerified && user.primaryRole === user_entity_1.UserRole.SUPER_ADMIN) {
            const payload = {
                sub: user._id,
                email: user.email,
                roles: user.primaryRole,
                type: 'pre-auth',
                isVerified: false,
                reason: 'unverified_email',
                version: user.tokenVersion,
            };
            const session = await this.userModel.db.startSession();
            await session.withTransaction(async () => {
                const event = new user_events_1.UserVerificationEmailRequestedEvent({
                    userId: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    verificationToken: user.verificationToken,
                });
                await this.eventPublisher.publish(event, session);
            });
            return {
                status: 222,
                message: 'Email not verified',
                verified: false,
                email: user.email,
                access_token: this.jwtService.sign(payload),
            };
        }
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        if (user.isActive) {
            const payload = {
                sub: user._id,
                email: user.email,
                roles: user.primaryRole,
                type: 'pre-auth',
                isVerified: false,
                reason: 'active_on_another_device',
                version: user.tokenVersion,
            };
            const session = await this.userModel.db.startSession();
            await session.withTransaction(async () => {
                user.verificationToken = verificationToken;
                await user.save({ session });
                const event = new user_events_1.UserLoggedInEvent({
                    userId: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    verificationToken,
                    deviceInfo: 'active_on_another_device',
                });
                await this.eventPublisher.publish(event, session);
            });
            return {
                status: 222,
                message: 'User logged in on another device',
                active: true,
                email: user.email,
                access_token: this.jwtService.sign(payload),
            };
        }
        const session = await this.userModel.db.startSession();
        await session.withTransaction(async () => {
            user.verificationToken = verificationToken;
            await user.save({ session });
            const event = new user_events_1.UserLoggedInEvent({
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                verificationToken,
            });
            await this.eventPublisher.publish(event, session);
        });
        console.log('Login Verification token---', verificationToken);
        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }
    async login(loginDto, isMobile) {
        const result = await this.validateUser(loginDto.email, loginDto.password, isMobile);
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
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        const isVerificationCodeValid = code === user.verificationToken;
        console.log('Verification code valid:', isVerificationCodeValid);
        if (!isVerificationCodeValid) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        user.isActive = true;
        user.lastLogin = new Date();
        user.verificationToken = null;
        await user.save();
        const payload = {
            sub: user._id,
            email: user.email,
            roles: user.primaryRole,
            type: 'auth',
            isVerified: true,
            version: user.tokenVersion,
            estate: user?.estateId?.toString(),
        };
        const userInstance = (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
        return {
            user: userInstance,
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
            primaryRole: user_entity_1.UserRole.SUPER_ADMIN,
            password: hashedPassword,
            verificationToken,
        });
        const session = await this.userModel.db.startSession();
        let savedUser;
        await session.withTransaction(async () => {
            savedUser = await newUser.save({ session });
            this.logger.log(`New user registered: ${savedUser.email}`);
            this.logger.log(`New user registered email token: ${verificationToken}`);
            const event = new user_events_1.UserCreatedEvent({
                userId: savedUser._id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                role: savedUser.primaryRole,
                verificationToken,
            });
            await this.eventPublisher.publish(event, session);
        });
        const resObj = {
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            phone: savedUser.phone,
            roles: savedUser.primaryRole,
            isActive: savedUser.isActive,
            isEmailVerified: savedUser.isEmailVerified,
            isTemporaryPassword: savedUser.isTemporaryPassword,
            id: savedUser._id,
            permissions: savedUser.basePermissions,
        };
        return resObj;
    }
    async register(registerDto) {
        const user = await this.validateUserRegistering(registerDto);
        console.log('USER', user);
        const payload = {
            sub: user.id.toString(),
            email: user.email,
            roles: user.primaryRole,
            type: 'auth',
            isVerified: false,
            version: 0,
        };
        return {
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
        if (!emailExistAndIsNotVerified) {
            throw new common_1.BadRequestException('Email does not exist');
        }
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
    async verifyPreAuth(info, payload) {
        const { email, code } = info;
        const user = await this.usersService.findByEmail(email);
        console.log('USER', user._id);
        console.log('PAYLOAD', payload);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user._id.toString() !== payload.userId) {
            throw new common_1.UnauthorizedException('Identity mismatch');
        }
        if (code !== user.verificationToken) {
            throw new common_1.BadRequestException('Invalid verification code');
        }
        if (payload.reason === 'unverified_email') {
            user.isEmailVerified = true;
        }
        else if (payload.reason === 'active_on_another_device') {
            user.tokenVersion += 1;
            const event = new user_events_1.UserSecurityAlertEvent({
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                alertType: 'device_switch',
                details: 'you have successfully switched your active session to a new device. Previous sessions have been logged out for your security.',
            });
            await this.eventPublisher.publish(event);
        }
        user.isActive = true;
        user.lastLogin = new Date();
        user.verificationToken = null;
        await user.save();
        const newPayload = {
            sub: user._id,
            email: user.email,
            roles: user.primaryRole,
            type: 'auth',
            isVerified: true,
            version: user.tokenVersion,
            estate: user?.estateId?.toString(),
        };
        const userInstance = (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
        return {
            user: userInstance,
            access_token: this.jwtService.sign(newPayload),
        };
    }
    async sendPasswordResetOTP(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('No account found with this email');
        }
        const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const session = await this.userModel.db.startSession();
        await session.withTransaction(async () => {
            user.passwordResetToken = resetOTP;
            user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save({ session });
            const event = new user_events_1.UserPasswordResetRequestedEvent({
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                resetToken: resetOTP,
            });
        });
        return { message: 'Password reset OTP has been sent to your email' };
    }
    async verifyPasswordResetOTP(email, otp) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('No account found with this email');
        }
        if (user.passwordResetToken !== otp ||
            !user.passwordResetExpires ||
            user.passwordResetExpires < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        const payload = {
            sub: user._id,
            email: user.email,
            type: 'password_reset',
        };
        const token = this.jwtService.sign(payload, { expiresIn: '5m' });
        return { token };
    }
    async resetPassword(resetToken, newPassword) {
        try {
            const payload = this.jwtService.verify(resetToken);
            if (payload.type !== 'password_reset') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const user = await this.userModel.findById(payload.sub);
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            user.isTemporaryPassword = false;
            await user.save();
            return { message: 'Password has been reset successfully' };
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError' ||
                error.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Invalid or expired token');
            }
            throw error;
        }
    }
    async logout(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        user.isActive = false;
        user.tokenVersion += 1;
        await user.save();
        this.logger.log(`User logged out: ${user.email}`);
        return { message: 'Logout successful' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        mongoose_2.Model,
        event_publisher_service_1.EventPublisher])
], AuthService);
//# sourceMappingURL=auth.service.js.map