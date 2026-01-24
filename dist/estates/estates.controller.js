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
exports.EstatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const estates_service_1 = require("./estates.service");
const create_estate_dto_1 = require("./dto/create-estate.dto");
const update_estate_dto_1 = require("./dto/update-estate.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const role_decorator_1 = require("../auth/decorators/role.decorator");
const users_service_1 = require("../users/users.service");
let EstatesController = class EstatesController {
    estatesService;
    usersService;
    constructor(estatesService, usersService) {
        this.estatesService = estatesService;
        this.usersService = usersService;
    }
    create(createEstateDto, request) {
        const userId = request.user.userId;
        return this.estatesService.create(createEstateDto, userId);
    }
    findAll() {
        return this.estatesService.findAll();
    }
    async findOne(id, request) {
        const userId = request.user.userId;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.estateId || (user.estateId && user.estateId.toString() !== id)) {
            throw new common_1.NotFoundException('User does not have permission to access this estate');
        }
        return this.estatesService.findOne(id);
    }
    async update(id, updateEstateDto, request) {
        const userId = request.user.userId;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.estateId || (user.estateId && user.estateId.toString() !== id)) {
            throw new common_1.NotFoundException('User does not have permission to access this estate');
        }
        return this.estatesService.update(id, updateEstateDto);
    }
    async remove(id, request) {
        const userId = request.user.userId;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.estateId || (user.estateId && user.estateId.toString() !== id)) {
            throw new common_1.NotFoundException('User does not have permission to access this estate');
        }
        return this.estatesService.remove(id);
    }
};
exports.EstatesController = EstatesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new estate',
        description: 'Allows Super Admins to register a new estate in the system.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Estate created successfully' }),
    (0, common_1.Post)('/create'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_estate_dto_1.CreateEstateDto, Object]),
    __metadata("design:returntype", void 0)
], EstatesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get all estates',
        description: 'Allows Site Admins to view all estates.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all estates' }),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SITE_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EstatesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get estate by ID',
        description: 'Allows Super Admins to view details of their own estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estate details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Estate not found or unauthorized' }),
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Update estate',
        description: 'Allows Super Admins to update details of their estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estate updated successfully' }),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_estate_dto_1.UpdateEstateDto, Object]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Delete estate',
        description: 'Allows Super Admins to delete their estate.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estate deleted successfully' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "remove", null);
exports.EstatesController = EstatesController = __decorate([
    (0, swagger_1.ApiTags)('Estates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('estates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [estates_service_1.EstatesService,
        users_service_1.UsersService])
], EstatesController);
//# sourceMappingURL=estates.controller.js.map