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
exports.TokenSchema = exports.Token = exports.hasUserVerifiedVisitorStatus = exports.MeansOfIdentification = exports.VisitorType = exports.TokenType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TokenType;
(function (TokenType) {
    TokenType["GATE_PASS"] = "gate_pass";
    TokenType["RESET_PASSWORD"] = "reset_password";
    TokenType["EMAIL_VERIFICATION"] = "email_verification";
    TokenType["REFRESH"] = "refresh";
})(TokenType || (exports.TokenType = TokenType = {}));
var VisitorType;
(function (VisitorType) {
    VisitorType["FAMILY"] = "family";
    VisitorType["FRIEND"] = "friend";
    VisitorType["SERVICE_PROVIDER"] = "service_provider";
    VisitorType["DELIVERY"] = "delivery";
    VisitorType["OTHER"] = "other";
})(VisitorType || (exports.VisitorType = VisitorType = {}));
var MeansOfIdentification;
(function (MeansOfIdentification) {
    MeansOfIdentification["DRIVERS_LICENCES"] = "driversLicence";
    MeansOfIdentification["NIN"] = "nin";
    MeansOfIdentification["VOTERS_CARD"] = "votersCard";
    MeansOfIdentification["INTERNATIONAL_PASSPORT"] = "internationalPassport";
    MeansOfIdentification["OTHERS"] = "others";
})(MeansOfIdentification || (exports.MeansOfIdentification = MeansOfIdentification = {}));
var hasUserVerifiedVisitorStatus;
(function (hasUserVerifiedVisitorStatus) {
    hasUserVerifiedVisitorStatus["PENDING"] = "pending";
    hasUserVerifiedVisitorStatus["COMPLETED"] = "completed";
    hasUserVerifiedVisitorStatus["FAILED"] = "failed";
    hasUserVerifiedVisitorStatus["UNVERIFIED"] = "unverified";
})(hasUserVerifiedVisitorStatus || (exports.hasUserVerifiedVisitorStatus = hasUserVerifiedVisitorStatus = {}));
let Token = class Token extends mongoose_2.Document {
    user;
    token;
    visitorName;
    visitorType;
    numberOfVisitors;
    hasCar;
    verifyVisitor;
    carPlateNumber;
    carModel;
    carColor;
    purpose;
    estate;
    property;
    expiresAt;
    used;
    meansOfId;
    idImgUrl;
    usedAt;
    hasUserVerifiedVisitor;
    verifiedBy;
};
exports.Token = Token;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", String)
], Token.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Token.prototype, "token", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Token.prototype, "visitorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: VisitorType, default: VisitorType.OTHER }),
    __metadata("design:type", String)
], Token.prototype, "visitorType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Token.prototype, "numberOfVisitors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Token.prototype, "hasCar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Token.prototype, "verifyVisitor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Token.prototype, "carPlateNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Token.prototype, "carModel", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Token.prototype, "carColor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Token.prototype, "purpose", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Estate' }),
    __metadata("design:type", String)
], Token.prototype, "estate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Property' }),
    __metadata("design:type", String)
], Token.prototype, "property", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Token.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Token.prototype, "used", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Token.prototype, "meansOfId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Token.prototype, "idImgUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Token.prototype, "usedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: hasUserVerifiedVisitorStatus.UNVERIFIED }),
    __metadata("design:type", String)
], Token.prototype, "hasUserVerifiedVisitor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", String)
], Token.prototype, "verifiedBy", void 0);
exports.Token = Token = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Token);
exports.TokenSchema = mongoose_1.SchemaFactory.createForClass(Token);
//# sourceMappingURL=token.entity.js.map