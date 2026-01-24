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
exports.CreatePropertyDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const property_entity_1 = require("../entities/property.entity");
class DocumentDto {
    title;
    fileType;
    url;
    uploadedAt;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Deed of Assignment', description: 'Document title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'application/pdf', description: 'MIME type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://cdn.example.com/docs/deed.pdf', description: 'File URL' }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upload timestamp' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], DocumentDto.prototype, "uploadedAt", void 0);
class CreatePropertyDto {
    identifier;
    type;
    landlordId;
    estateId;
    tenantId;
    size;
    bedrooms;
    bathrooms;
    description;
    photos;
    documents;
    occupancyStatus;
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BLOCK-A-UNIT-1', description: 'Unique identifier for the property' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "identifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: property_entity_1.PropertyType, description: 'Type of property' }),
    (0, class_validator_1.IsEnum)(property_entity_1.PropertyType),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60f1a5b8e1234567890abcde', description: 'Landlord User ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "landlordId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60f1a5b8e1234567890abcde', description: 'Estate ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "estateId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'List of tenant User IDs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1200 sqft', description: 'Property size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3, description: 'Number of bedrooms' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bedrooms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2, description: 'Number of bathrooms' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bathrooms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'A beautiful 3-bedroom apartment.', description: 'Brief description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'List of photo URLs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [DocumentDto], description: 'List of property documents' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DocumentDto),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: property_entity_1.OccupancyStatus, description: 'Occupancy status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(property_entity_1.OccupancyStatus),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "occupancyStatus", void 0);
//# sourceMappingURL=create-property.dto.js.map