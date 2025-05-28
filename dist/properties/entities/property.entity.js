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
exports.PropertySchema = exports.Property = exports.OccupancyStatus = exports.PropertyType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../../users/entities/user.entity");
const estate_entity_1 = require("../../estates/entities/estate.entity");
var PropertyType;
(function (PropertyType) {
    PropertyType["APARTMENT"] = "apartment";
    PropertyType["DUPLEX"] = "duplex";
    PropertyType["BUNGALOW"] = "bungalow";
    PropertyType["COMMERCIAL"] = "commercial";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var OccupancyStatus;
(function (OccupancyStatus) {
    OccupancyStatus["VACANT"] = "vacant";
    OccupancyStatus["OCCUPIED"] = "occupied";
})(OccupancyStatus || (exports.OccupancyStatus = OccupancyStatus = {}));
let Property = class Property extends mongoose_2.Document {
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
    createdAt;
    updatedAt;
};
exports.Property = Property;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Property.prototype, "identifier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PropertyType }),
    __metadata("design:type", String)
], Property.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", user_entity_1.User)
], Property.prototype, "landlordId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Estate', required: true }),
    __metadata("design:type", estate_entity_1.Estate)
], Property.prototype, "estateId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", Array)
], Property.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Property.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Property.prototype, "bedrooms", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Property.prototype, "bathrooms", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Property.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], Property.prototype, "photos", void 0);
__decorate([
    (0, mongoose_1.Prop)([{
            title: String,
            fileType: String,
            url: String,
            uploadedAt: { type: Date, default: Date.now }
        }]),
    __metadata("design:type", Array)
], Property.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: OccupancyStatus, default: OccupancyStatus.VACANT }),
    __metadata("design:type", String)
], Property.prototype, "occupancyStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Property.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Property.prototype, "updatedAt", void 0);
exports.Property = Property = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Property);
exports.PropertySchema = mongoose_1.SchemaFactory.createForClass(Property);
//# sourceMappingURL=property.entity.js.map