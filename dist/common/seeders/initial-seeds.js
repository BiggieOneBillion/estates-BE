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
var InitialSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../users/entities/user.entity");
const estate_entity_1 = require("../../estates/entities/estate.entity");
let InitialSeedService = InitialSeedService_1 = class InitialSeedService {
    userModel;
    estateModel;
    logger = new common_1.Logger(InitialSeedService_1.name);
    constructor(userModel, estateModel) {
        this.userModel = userModel;
        this.estateModel = estateModel;
    }
    async seed() {
        const userCount = await this.userModel.countDocuments();
        if (userCount > 0) {
            this.logger.log('Database already seeded');
            return;
        }
        this.logger.log('Seeding database...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const superAdmin = await this.userModel.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: hashedPassword,
            phone: '1234567890',
            primaryRole: user_entity_1.UserRole.SUPER_ADMIN,
        });
        const estate = await this.estateModel.create({
            owner: superAdmin._id,
            name: 'Sample Estate',
            location: {
                address: '123 Sample Street',
                city: 'Sample City',
                state: 'Sample State',
                country: 'Sample Country',
            },
            zipCode: '12345',
            description: 'A sample estate for demonstration purposes',
        });
        const estateAdminPassword = await bcrypt.hash('estateadmin123', 10);
        await this.userModel.create({
            firstName: 'Estate',
            lastName: 'Admin',
            email: 'estateadmin@example.com',
            password: estateAdminPassword,
            phone: '1234567891',
            primaryRole: user_entity_1.UserRole.ADMIN,
            estate: estate._id,
        });
        const landlordPassword = await bcrypt.hash('landlord123', 10);
        await this.userModel.create({
            firstName: 'Landlord',
            lastName: 'User',
            email: 'landlord@example.com',
            password: landlordPassword,
            phone: '1234567892',
            primaryRole: user_entity_1.UserRole.LANDLORD,
            estate: estate._id,
        });
        const tenantPassword = await bcrypt.hash('tenant123', 10);
        await this.userModel.create({
            firstName: 'Tenant',
            lastName: 'User',
            email: 'tenant@example.com',
            password: tenantPassword,
            phone: '1234567893',
            primaryRole: user_entity_1.UserRole.TENANT,
            estate: estate._id,
        });
        const securityPassword = await bcrypt.hash('security123', 10);
        await this.userModel.create({
            firstName: 'Security',
            lastName: 'User',
            email: 'security@example.com',
            password: securityPassword,
            phone: '1234567894',
            primaryRole: user_entity_1.UserRole.SECURITY,
            estate: estate._id,
        });
        this.logger.log('Database seeding completed');
    }
};
exports.InitialSeedService = InitialSeedService;
exports.InitialSeedService = InitialSeedService = InitialSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(estate_entity_1.Estate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InitialSeedService);
//# sourceMappingURL=initial-seeds.js.map