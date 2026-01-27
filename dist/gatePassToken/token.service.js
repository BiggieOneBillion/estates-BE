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
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const token_entity_1 = require("./entities/token.entity");
const crypto = require("crypto");
const event_emitter_1 = require("@nestjs/event-emitter");
const domain_events_1 = require("../common/events/domain-events");
const users_service_1 = require("../users/users.service");
const compliance_service_1 = require("../compliance/compliance.service");
let TokenService = TokenService_1 = class TokenService {
    tokenModel;
    eventEmitter;
    userService;
    complianceService;
    logger = new common_1.Logger(TokenService_1.name);
    constructor(tokenModel, eventEmitter, userService, complianceService) {
        this.tokenModel = tokenModel;
        this.eventEmitter = eventEmitter;
        this.userService = userService;
        this.complianceService = complianceService;
    }
    async create(createTokenDto, userId) {
        const compliance = await this.complianceService.checkUserCompliance(userId);
        if (!compliance.canCreateToken) {
            throw new common_1.ForbiddenException({
                message: 'Cannot create gate pass token. You have outstanding payments.',
                statusCode: 403,
                error: 'Payment Required',
                outstandingLevies: compliance.outstandingLevies.map(levy => ({
                    id: levy._id,
                    title: levy.title,
                    amount: levy.amount,
                    dueDate: levy.dueDate,
                    description: levy.description,
                })),
                totalOutstanding: compliance.totalOutstanding,
            });
        }
        if (!createTokenDto.token) {
            createTokenDto.token = this.generateUniqueToken();
        }
        if (!createTokenDto.expiresAt) {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            createTokenDto.expiresAt = expiresAt;
        }
        if (createTokenDto.hasCar && !createTokenDto.carPlateNumber) {
            throw new common_1.BadRequestException('Car plate number is required when visitor has a car');
        }
        const newToken = new this.tokenModel({
            ...createTokenDto,
            user: userId,
            hasUserVerifiedVisitor: createTokenDto.verifyVisitor
                ? token_entity_1.hasUserVerifiedVisitorStatus.UNVERIFIED
                : token_entity_1.hasUserVerifiedVisitorStatus.COMPLETED,
        });
        return newToken.save();
    }
    async verifyVisitorToken(tokenString, userId) {
        const token = await this.findByTokenString(tokenString);
        if (token.user.toString() !== userId) {
            throw new common_1.BadRequestException('You are not authorized to verify this token');
        }
        const userInfo = await this.userService.findOne(userId);
        token.hasUserVerifiedVisitor = token_entity_1.hasUserVerifiedVisitorStatus.COMPLETED;
        const securityUser = await this.userService.findSecurity(userInfo.estateId.toString());
        if (!securityUser) {
            throw new common_1.NotFoundException('No security user found, Please register a security personnel');
        }
        const user = securityUser.id;
        const savedToken = await token.save();
        this.eventEmitter.emit(domain_events_1.DomainEvents.VISITOR_VERIFIED, new domain_events_1.TokenEvent(token.user.toString(), token._id.toString(), token.token, { securityId: user }));
        return savedToken;
    }
    async findAll() {
        return this.tokenModel.find().exec();
    }
    async findAllByUser(userId) {
        return this.tokenModel.find({ user: userId }).exec();
    }
    async findAllByEstate(estateId) {
        return this.tokenModel.find({ estate: estateId }).exec();
    }
    async findOne(id) {
        const token = await this.tokenModel.findById(id).exec();
        if (!token) {
            throw new common_1.NotFoundException(`Token with ID ${id} not found`);
        }
        return token;
    }
    async findByTokenString(tokenString) {
        const token = await this.tokenModel.findOne({ token: tokenString }).exec();
        if (!token) {
            throw new common_1.NotFoundException(`Token ${tokenString} not found`);
        }
        return token;
    }
    async update(id, updateTokenDto, userId, isImage) {
        const [token, user] = await Promise.all([
            this.findOne(id),
            this.userService.findOne(userId),
        ]);
        const updatedToken = await this.tokenModel
            .findByIdAndUpdate(id, updateTokenDto, { new: true })
            .exec();
        if (!updatedToken) {
            throw new common_1.NotFoundException(`Token with ID ${id} not found`);
        }
        if (isImage) {
            token.hasUserVerifiedVisitor = token_entity_1.hasUserVerifiedVisitorStatus.PENDING;
            await token.save();
        }
        const securityPersonnel = await this.userService.findSecurity(user.estateId.toString());
        if (!securityPersonnel) {
            throw new common_1.BadRequestException('Invalid security details');
        }
        const tokenId = token._id.toString();
        const tokenString = token.token;
        const tokenOwnerId = token.user.toString();
        const securityId = securityPersonnel.id.toString();
        if (updateTokenDto.hasUserVerifiedVisitor &&
            updateTokenDto.hasUserVerifiedVisitor ===
                token_entity_1.hasUserVerifiedVisitorStatus.COMPLETED) {
            this.eventEmitter.emit(domain_events_1.DomainEvents.VISITOR_VERIFIED, new domain_events_1.TokenEvent(tokenOwnerId, tokenId, tokenString, { securityId }));
        }
        else if (updateTokenDto.hasUserVerifiedVisitor &&
            updateTokenDto.hasUserVerifiedVisitor ===
                token_entity_1.hasUserVerifiedVisitorStatus.FAILED) {
            this.eventEmitter.emit(domain_events_1.DomainEvents.VISITOR_REJECTED, new domain_events_1.TokenEvent(tokenOwnerId, tokenId, tokenString, { securityId }));
        }
        else {
            this.eventEmitter.emit(domain_events_1.DomainEvents.TOKEN_UPDATED, new domain_events_1.TokenEvent(tokenOwnerId, tokenId, tokenString, { isImage }));
        }
        return updatedToken;
    }
    async verifyToken(tokenString, securityUserId) {
        const token = await this.findByTokenString(tokenString);
        if (new Date() > token.expiresAt) {
            throw new common_1.BadRequestException('Token has expired');
        }
        if (token.used) {
            throw new common_1.BadRequestException('Token has already been used');
        }
        if (token.hasUserVerifiedVisitor !== token_entity_1.hasUserVerifiedVisitorStatus.COMPLETED &&
            token.verifyVisitor) {
            throw new common_1.BadRequestException('Visitor has not been verified by occupant');
        }
        token.used = true;
        token.usedAt = new Date();
        token.verifiedBy = securityUserId;
        const savedToken = await token.save();
        this.eventEmitter.emit(domain_events_1.DomainEvents.TOKEN_VERIFIED, new domain_events_1.TokenEvent(token.user.toString(), token._id.toString(), token.token));
        return savedToken;
    }
    async remove(id) {
        const result = await this.tokenModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Token with ID ${id} not found`);
        }
    }
    generateUniqueToken() {
        return crypto.randomBytes(3).toString('hex').toUpperCase();
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(token_entity_1.Token.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        event_emitter_1.EventEmitter2,
        users_service_1.UsersService,
        compliance_service_1.ComplianceService])
], TokenService);
//# sourceMappingURL=token.service.js.map