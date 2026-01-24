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
var EstatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const estate_entity_1 = require("./entities/estate.entity");
const user_entity_1 = require("../users/entities/user.entity");
let EstatesService = EstatesService_1 = class EstatesService {
    estateModel;
    userModel;
    connection;
    logger = new common_1.Logger(EstatesService_1.name);
    constructor(estateModel, userModel, connection) {
        this.estateModel = estateModel;
        this.userModel = userModel;
        this.connection = connection;
    }
    async create(createEstateDto, userId) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const existingEstate = await this.estateModel
                .findOne({ name: createEstateDto.name })
                .session(session);
            if (existingEstate) {
                throw new common_1.ConflictException('Estate name already exists');
            }
            const user = await this.userModel.findById(userId).session(session);
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            if (!user.isEmailVerified) {
                throw new common_1.ConflictException('User email not verified yet. Cannot create estate');
            }
            if (user.estateId) {
                throw new common_1.ConflictException('User already has an estate');
            }
            const newEstate = new this.estateModel({
                ...createEstateDto,
                owner: userId,
            });
            await newEstate.save({ session });
            user.estateId = newEstate._id;
            await user.save({ session });
            await session.commitTransaction();
            this.logger.log(`Estate "${newEstate.name}" created successfully for user ${userId}`);
            return newEstate;
        }
        catch (error) {
            await session.abortTransaction();
            this.logger.error(`Failed to create estate: ${error.message}`);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async findAll() {
        return this.estateModel.find().exec();
    }
    async findOne(id) {
        const estate = await this.estateModel.findById(id).exec();
        if (!estate) {
            throw new common_1.NotFoundException(`Estate with ID ${id} not found`);
        }
        return estate;
    }
    async update(id, updateEstateDto) {
        const estate = await this.estateModel.findById(id);
        if (!estate) {
            throw new common_1.NotFoundException(`Estate with ID ${id} not found`);
        }
        const updatedEstate = await this.estateModel
            .findByIdAndUpdate(id, updateEstateDto, { new: true })
            .exec();
        if (!updatedEstate) {
            throw new common_1.NotFoundException(`Estate with ID ${id} not found`);
        }
        return updatedEstate;
    }
    async remove(id) {
        const result = await this.estateModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Estate with ID ${id} not found`);
        }
    }
};
exports.EstatesService = EstatesService;
exports.EstatesService = EstatesService = EstatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(estate_entity_1.Estate.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection])
], EstatesService);
//# sourceMappingURL=estates.service.js.map