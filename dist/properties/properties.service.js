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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const property_entity_1 = require("./entities/property.entity");
let PropertiesService = class PropertiesService {
    propertyModel;
    constructor(propertyModel) {
        this.propertyModel = propertyModel;
    }
    async create(createPropertyDto) {
        const newProperty = new this.propertyModel(createPropertyDto);
        return newProperty.save();
    }
    async findAll() {
        return this.propertyModel.find().exec();
    }
    async findByEstate(estateId) {
        return this.propertyModel.find({ estate: estateId }).exec();
    }
    async findOne(id) {
        const property = await this.propertyModel.findById(id).exec();
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        return property;
    }
    async update(id, updatePropertyDto) {
        const property = await this.propertyModel.findById(id);
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        const updatedProperty = await this.propertyModel
            .findByIdAndUpdate(id, updatePropertyDto, { new: true })
            .exec();
        if (!updatedProperty) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        return updatedProperty;
    }
    async remove(id) {
        const result = await this.propertyModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(property_entity_1.Property.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map