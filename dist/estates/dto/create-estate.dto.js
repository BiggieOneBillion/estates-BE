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
exports.CreateEstateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const estate_entity_1 = require("../entities/estate.entity");
class CoordinatesDto {
    lat;
    lng;
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 6.5244, description: 'Latitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoordinatesDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3.3792, description: 'Longitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoordinatesDto.prototype, "lng", void 0);
class LocationDto {
    address;
    city;
    state;
    country;
    coordinates;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Estate Road', description: 'Street address' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lagos', description: 'City' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lagos State', description: 'State or Province' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nigeria', description: 'Country' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CoordinatesDto, description: 'Geo coordinates' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CoordinatesDto),
    __metadata("design:type", CoordinatesDto)
], LocationDto.prototype, "coordinates", void 0);
class SubscriptionDto {
    plan;
    startDate;
    endDate;
    status;
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: estate_entity_1.SubscriptionPlan, description: 'Subscription plan type' }),
    (0, class_validator_1.IsEnum)(estate_entity_1.SubscriptionPlan),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subscription start date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Subscription end date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: estate_entity_1.SubscriptionStatus, description: 'Subscription status' }),
    (0, class_validator_1.IsEnum)(estate_entity_1.SubscriptionStatus),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "status", void 0);
class SupportingDocumentDto {
    filename;
    fileType;
    url;
    uploadedAt;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'deed.pdf', description: 'Filename' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SupportingDocumentDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'application/pdf', description: 'MIME type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SupportingDocumentDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://cdn.example.com/files/deed.pdf', description: 'File URL' }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], SupportingDocumentDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upload timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SupportingDocumentDto.prototype, "uploadedAt", void 0);
class CreateEstateDto {
    name;
    location;
    supportingDocuments;
    description;
    logo;
}
exports.CreateEstateDto = CreateEstateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Greenwood Estate', description: 'Name of the estate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEstateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: LocationDto, description: 'Location details' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    __metadata("design:type", LocationDto)
], CreateEstateDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [SupportingDocumentDto],
        description: 'List of supporting documents',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SupportingDocumentDto),
    __metadata("design:type", Array)
], CreateEstateDto.prototype, "supportingDocuments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'A serene residential estate.', description: 'Brief description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEstateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.example.com/logos/estate.png', description: 'Logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEstateDto.prototype, "logo", void 0);
//# sourceMappingURL=create-estate.dto.js.map