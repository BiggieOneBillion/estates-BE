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
exports.EstateSchema = exports.Estate = exports.SubscriptionStatus = exports.SubscriptionPlan = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["MONTHLY"] = "monthly";
    SubscriptionPlan["YEARLY"] = "yearly";
    SubscriptionPlan["FREE"] = "free";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
const now = new Date();
let Estate = class Estate extends mongoose_2.Document {
    name;
    location;
    subscription;
    supportingDocuments;
    description;
    logo;
    createdAt;
    updatedAt;
};
exports.Estate = Estate;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Estate.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number },
            },
        },
    }),
    __metadata("design:type", Object)
], Estate.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            plan: {
                type: String,
                enum: Object.values(SubscriptionPlan),
                default: SubscriptionPlan.FREE,
            },
            startDate: { type: Date, default: Date.now },
            endDate: {
                type: Date,
                default: new Date(now.setFullYear(now.getFullYear() + 1)),
            },
            status: {
                type: String,
                enum: Object.values(SubscriptionStatus),
                default: SubscriptionStatus.ACTIVE,
            },
        },
    }),
    __metadata("design:type", Object)
], Estate.prototype, "subscription", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                filename: String,
                fileType: String,
                url: String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Estate.prototype, "supportingDocuments", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Estate.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Estate.prototype, "logo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Estate.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Estate.prototype, "updatedAt", void 0);
exports.Estate = Estate = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Estate);
exports.EstateSchema = mongoose_1.SchemaFactory.createForClass(Estate);
//# sourceMappingURL=estate.entity.js.map