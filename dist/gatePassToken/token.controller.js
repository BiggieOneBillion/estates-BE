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
exports.TokenController = void 0;
const common_1 = require("@nestjs/common");
const create_token_dto_1 = require("./dto/create-token.dto");
const update_token_dto_1 = require("./dto/update-token.dto");
const means_of_identification_dto_1 = require("./dto/means-of-identification.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const role_decorator_1 = require("../auth/decorators/role.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const verified_guard_1 = require("../auth/guards/verified.guard");
const token_response_dto_1 = require("./dto/response/token.response.dto");
const cqrs_1 = require("@nestjs/cqrs");
const create_token_command_1 = require("./cqrs/commands/impl/create-token.command");
const update_token_command_1 = require("./cqrs/commands/impl/update-token.command");
const delete_token_command_1 = require("./cqrs/commands/impl/delete-token.command");
const verify_token_command_1 = require("./cqrs/commands/impl/verify-token.command");
const verify_visitor_token_command_1 = require("./cqrs/commands/impl/verify-visitor-token.command");
const token_queries_impl_1 = require("./cqrs/queries/impl/token-queries.impl");
const find_user_by_id_query_1 = require("../users/cqrs/queries/impl/find-user-by-id.query");
let TokenController = class TokenController {
    cloudinaryService;
    commandBus;
    queryBus;
    constructor(cloudinaryService, commandBus, queryBus) {
        this.cloudinaryService = cloudinaryService;
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(createTokenDto, req) {
        const user = await this.queryBus.execute(new find_user_by_id_query_1.FindUserByIdQuery(req.user.userId));
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.canCreateToken === false) {
            throw new common_1.ForbiddenException('You are not authorized to create tokens. This feature has been disabled for your account.');
        }
        if (user.estateId.toString() !== createTokenDto.estate) {
            throw new common_1.BadRequestException('You are not authorized to create this token');
        }
        console.log('THE VERY END');
        return this.commandBus.execute(new create_token_command_1.CreateTokenCommand(createTokenDto, req.user.userId));
    }
    async createMeansOfIdentification(file, meansOfIdDto, req) {
        if (!file) {
            throw new common_1.BadRequestException('No identification image uploaded');
        }
        const token = await this.queryBus.execute(new token_queries_impl_1.FindTokenByIdQuery(meansOfIdDto.token));
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        const updatedToken = await this.commandBus.execute(new update_token_command_1.UpdateTokenCommand(token._id, {
            meansOfId: meansOfIdDto.meansOfId,
            idImgUrl: uploadResult.secure_url,
        }, req.user.userId, true));
        return {
            message: 'Means of identification added successfully',
            token: updatedToken,
        };
    }
    async findAll(req, estateId) {
        const user = await this.queryBus.execute(new find_user_by_id_query_1.FindUserByIdQuery(req.user.userId));
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (estateId) {
            if (user.primaryRole !== user_entity_1.UserRole.SUPER_ADMIN) {
                if (user.estateId?.toString() !== estateId) {
                    throw new common_1.BadRequestException('You are not authorized to access tokens from this estate');
                }
            }
            if (user.primaryRole === user_entity_1.UserRole.ADMIN) {
                const hasPermission = user.adminDetails?.positionPermissions?.some((permission) => permission.resource === user_entity_1.ResourceType.SECURITY &&
                    (permission.actions.includes(user_entity_1.PermissionAction.READ) ||
                        permission.actions.includes(user_entity_1.PermissionAction.MANAGE))) || false;
                const hasAdditionalPermission = user.adminDetails?.additionalPermissions?.some((permission) => permission.resource === user_entity_1.ResourceType.SECURITY &&
                    (permission.actions.includes(user_entity_1.PermissionAction.READ) ||
                        permission.actions.includes(user_entity_1.PermissionAction.MANAGE))) || false;
                if (!hasPermission && !hasAdditionalPermission) {
                    throw new common_1.BadRequestException('You do not have permission to access token information');
                }
            }
            const data = await this.queryBus.execute(new token_queries_impl_1.FindTokensByEstateQuery(estateId));
            return data.filter((el) => el.used);
        }
        else {
            if (user.primaryRole !== user_entity_1.UserRole.SITE_ADMIN) {
                throw new common_1.BadRequestException('Only site admins can view all tokens across estates');
            }
            return this.queryBus.execute(new token_queries_impl_1.FindAllTokensQuery());
        }
    }
    async findUserTokens(req, param) {
        const superAdmin = await this.queryBus.execute(new find_user_by_id_query_1.FindUserByIdQuery(req.user.userId));
        if (!superAdmin) {
            throw new common_1.BadRequestException('Super admin not found');
        }
        const user = await this.queryBus.execute(new find_user_by_id_query_1.FindUserByIdQuery(param.id));
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.estateId?.toString() !== superAdmin.estateId?.toString()) {
            throw new common_1.BadRequestException('You are not authorized to view this user tokens');
        }
        return this.queryBus.execute(new token_queries_impl_1.FindTokensByUserQuery(param.id));
    }
    findMyTokens(req) {
        return this.queryBus.execute(new token_queries_impl_1.FindTokensByUserQuery(req.user.userId));
    }
    findOne(tokenId) {
        return this.queryBus.execute(new token_queries_impl_1.FindTokenByStringQuery(tokenId));
    }
    verifyToken(token, req) {
        return this.commandBus.execute(new verify_token_command_1.VerifyTokenCommand(token, req.user.userId));
    }
    verifyVisitorToken(token, req) {
        return this.commandBus.execute(new verify_visitor_token_command_1.VerifyVisitorTokenCommand(token, req.user.userId));
    }
    update(tokenId, updateTokenDto, req) {
        const user = req.user.userId;
        return this.commandBus.execute(new update_token_command_1.UpdateTokenCommand(tokenId, updateTokenDto, user));
    }
    remove(tokenId) {
        return this.commandBus.execute(new delete_token_command_1.DeleteTokenCommand(tokenId));
    }
};
exports.TokenController = TokenController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new gate pass token for visitors' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: token_response_dto_1.TokenResponseDto, description: 'Token created successfully' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.LANDLORD, user_entity_1.UserRole.TENANT, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_token_dto_1.CreateTokenDto, Object]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('means-of-identification'),
    (0, swagger_1.ApiOperation)({ summary: 'Create means of identification to visitors' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Token means of identification created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Token not found' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SECURITY, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, means_of_identification_dto_1.MeansOfIdentificationDto, Object]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "createMeansOfIdentification", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tokens' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [token_response_dto_1.TokenResponseDto], description: 'Return all tokens' }),
    (0, swagger_1.ApiQuery)({
        name: 'estate',
        required: false,
        description: 'Filter by estate ID',
    }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.SECURITY),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('get-user-tokens/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tokens created by the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [token_response_dto_1.TokenResponseDto], description: 'Return all user tokens' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "findUserTokens", null);
__decorate([
    (0, common_1.Get)('my-tokens'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tokens created by the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [token_response_dto_1.TokenResponseDto], description: 'Return all user tokens' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.LANDLORD, user_entity_1.UserRole.TENANT, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "findMyTokens", null);
__decorate([
    (0, common_1.Get)(':tokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get token by id' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: token_response_dto_1.TokenResponseDto, description: 'Return token by id' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.SECURITY),
    __param(0, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('verify/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a gate pass token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token verified successfully' }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'The token string to verify' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SECURITY, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "verifyToken", null);
__decorate([
    (0, common_1.Post)('verify-visitor/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a gate pass token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token verified successfully' }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'The token string to verify' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.TENANT, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.LANDLORD),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "verifyVisitorToken", null);
__decorate([
    (0, common_1.Patch)(':tokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token updated successfully' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.LANDLORD, user_entity_1.UserRole.TENANT, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('tokenId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_token_dto_1.UpdateTokenDto, Object]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':tokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token deleted successfully' }),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.LANDLORD, user_entity_1.UserRole.TENANT, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "remove", null);
exports.TokenController = TokenController = __decorate([
    (0, swagger_1.ApiTags)('Gate Pass Tokens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tokens'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, verified_guard_1.VerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], TokenController);
//# sourceMappingURL=token.controller.js.map