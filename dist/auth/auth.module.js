"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = exports.CommandHandlers = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const users_module_1 = require("../users/users.module");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("../users/entities/user.entity");
const mail_service_1 = require("../common/services/mail.service");
const events_infrastructure_module_1 = require("../common/events/events-infrastructure.module");
const cqrs_1 = require("@nestjs/cqrs");
const login_handler_1 = require("./cqrs/commands/handlers/login.handler");
const register_handler_1 = require("./cqrs/commands/handlers/register.handler");
const verify_preauth_handler_1 = require("./cqrs/commands/handlers/verify-preauth.handler");
const verify_email_handler_1 = require("./cqrs/commands/handlers/verify-email.handler");
const forgot_password_handler_1 = require("./cqrs/commands/handlers/forgot-password.handler");
const verify_reset_otp_handler_1 = require("./cqrs/commands/handlers/verify-reset-otp.handler");
const reset_password_handler_1 = require("./cqrs/commands/handlers/reset-password.handler");
const logout_handler_1 = require("./cqrs/commands/handlers/logout.handler");
const verify_login_handler_1 = require("./cqrs/commands/handlers/verify-login.handler");
exports.CommandHandlers = [
    login_handler_1.LoginHandler,
    register_handler_1.RegisterHandler,
    verify_preauth_handler_1.VerifyPreAuthHandler,
    verify_email_handler_1.VerifyEmailHandler,
    forgot_password_handler_1.ForgotPasswordHandler,
    verify_reset_otp_handler_1.VerifyResetOtpHandler,
    reset_password_handler_1.ResetPasswordHandler,
    logout_handler_1.LogoutHandler,
    verify_login_handler_1.VerifyLoginHandler,
];
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            users_module_1.UsersModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '365d' },
                }),
            }),
            mongoose_1.MongooseModule.forFeature([{ name: user_entity_1.User.name, schema: user_entity_1.UserSchema }]),
            events_infrastructure_module_1.EventsInfrastructureModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [jwt_strategy_1.JwtStrategy, mail_service_1.MailService, ...exports.CommandHandlers],
        exports: [jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map