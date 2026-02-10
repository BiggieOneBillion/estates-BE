"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModule = exports.QueryHandlers = exports.CommandHandlers = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cqrs_1 = require("@nestjs/cqrs");
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
const create_token_handler_1 = require("./cqrs/commands/handlers/create-token.handler");
const update_token_handler_1 = require("./cqrs/commands/handlers/update-token.handler");
const verify_token_handler_1 = require("./cqrs/commands/handlers/verify-token.handler");
const verify_visitor_token_handler_1 = require("./cqrs/commands/handlers/verify-visitor-token.handler");
const delete_token_handler_1 = require("./cqrs/commands/handlers/delete-token.handler");
const find_all_tokens_handler_1 = require("./cqrs/queries/handlers/find-all-tokens.handler");
const find_tokens_by_user_handler_1 = require("./cqrs/queries/handlers/find-tokens-by-user.handler");
const find_tokens_by_estate_handler_1 = require("./cqrs/queries/handlers/find-tokens-by-estate.handler");
const find_token_by_id_handler_1 = require("./cqrs/queries/handlers/find-token-by-id.handler");
const find_token_by_string_handler_1 = require("./cqrs/queries/handlers/find-token-by-string.handler");
exports.CommandHandlers = [
    create_token_handler_1.CreateTokenHandler,
    update_token_handler_1.UpdateTokenHandler,
    verify_token_handler_1.VerifyTokenHandler,
    verify_visitor_token_handler_1.VerifyVisitorTokenHandler,
    delete_token_handler_1.DeleteTokenHandler,
];
exports.QueryHandlers = [
    find_all_tokens_handler_1.FindAllTokensHandler,
    find_tokens_by_user_handler_1.FindTokensByUserHandler,
    find_tokens_by_estate_handler_1.FindTokensByEstateHandler,
    find_token_by_id_handler_1.FindTokenByIdHandler,
    find_token_by_string_handler_1.FindTokenByStringHandler,
];
let TokenModule = class TokenModule {
};
exports.TokenModule = TokenModule;
exports.TokenModule = TokenModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            mongoose_1.MongooseModule.forFeature([{ name: token_entity_1.Token.name, schema: token_entity_1.TokenSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: user_entity_1.User.name, schema: user_entity_1.UserSchema }]),
            users_module_1.UsersModule,
            cloudinary_module_1.CloudinaryModule,
            notifications_module_1.NotificationsModule,
            events_module_1.EventsModule,
            compliance_module_1.ComplianceModule,
        ],
        controllers: [token_controller_1.TokenController],
        providers: [
            token_service_1.TokenService,
            users_service_1.UsersService,
            mail_service_1.MailService,
            ...exports.CommandHandlers,
            ...exports.QueryHandlers,
        ],
        exports: [token_service_1.TokenService],
    })
], TokenModule);
//# sourceMappingURL=token.module.js.map