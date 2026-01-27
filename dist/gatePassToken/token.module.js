"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const token_service_1 = require("./token.service");
const token_controller_1 = require("./token.controller");
const token_entity_1 = require("./entities/token.entity");
const users_service_1 = require("../users/users.service");
const mail_service_1 = require("../common/services/mail.service");
const user_entity_1 = require("../users/entities/user.entity");
const users_module_1 = require("../users/users.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const notifications_module_1 = require("../notifications/notifications.module");
const events_module_1 = require("../events/events.module");
const compliance_module_1 = require("../compliance/compliance.module");
let TokenModule = class TokenModule {
};
exports.TokenModule = TokenModule;
exports.TokenModule = TokenModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: token_entity_1.Token.name, schema: token_entity_1.TokenSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: user_entity_1.User.name, schema: user_entity_1.UserSchema }]),
            users_module_1.UsersModule,
            cloudinary_module_1.CloudinaryModule,
            notifications_module_1.NotificationsModule,
            events_module_1.EventsModule,
            compliance_module_1.ComplianceModule,
        ],
        controllers: [token_controller_1.TokenController],
        providers: [token_service_1.TokenService, users_service_1.UsersService, mail_service_1.MailService],
        exports: [token_service_1.TokenService],
    })
], TokenModule);
//# sourceMappingURL=token.module.js.map