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
exports.NotificationSchema = exports.Notification = exports.NotificationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var NotificationType;
(function (NotificationType) {
    NotificationType["TOKEN_UPDATED"] = "token_updated";
    NotificationType["TOKEN_VERIFIED"] = "token_verified";
    NotificationType["TOKEN_EXPIRED"] = "token_expired";
    NotificationType["VISITOR_VERIFIED"] = "visitor_verified";
    NotificationType["VERIFY_VISTOR"] = "verify_vistor";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification extends mongoose_2.Document {
    user;
    type;
    message;
    data;
    read;
    readAt;
};
exports.Notification = Notification;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", String)
], Notification.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: NotificationType }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], Notification.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "read", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
exports.Notification = Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
//# sourceMappingURL=notification.entity.js.map