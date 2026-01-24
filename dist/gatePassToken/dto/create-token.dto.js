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
exports.CreateTokenDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const token_entity_1 = require("../entities/token.entity");
class CreateTokenDto {
    token;
    visitorName;
    visitorType = token_entity_1.VisitorType.OTHER;
    numberOfVisitors = 1;
    hasCar = false;
    carPlateNumber;
    carModel;
    carColor;
    purpose;
    estate;
    property;
    meansOfId;
    idImgUrl;
    expiresAt;
    used;
    verifyVisitor = false;
}
exports.CreateTokenDto = CreateTokenDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'The generated token string (optional, auto-generated if not provided)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'Name of the visitor' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "visitorName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: token_entity_1.VisitorType, default: token_entity_1.VisitorType.OTHER, description: 'Category of the visitor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(token_entity_1.VisitorType),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "visitorType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, default: 1, description: 'Total number of visitors' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTokenDto.prototype, "numberOfVisitors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, default: false, description: 'Whether the visitor has a vehicle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateTokenDto.prototype, "hasCar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ABC-123-XY', description: 'Vehicle plate number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "carPlateNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Toyota Camry', description: 'Vehicle model' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "carModel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Silver', description: 'Vehicle color' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "carColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Visiting a friend', description: 'Purpose of the visit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60f1a5b8e1234567890abcde', description: 'Estate ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "estate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60f1a5b8e1234567890abcde', description: 'Property ID (if applicable)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "property", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'National ID', description: 'Type of identification provided' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "meansOfId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.example.com/ids/visitor.jpg', description: 'URL to identification image' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "idImgUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token expiration date and time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateTokenDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'Whether the token has been used' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTokenDto.prototype, "used", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, default: false, description: 'Whether to require visitor verification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateTokenDto.prototype, "verifyVisitor", void 0);
//# sourceMappingURL=create-token.dto.js.map