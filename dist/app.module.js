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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const estates_module_1 = require("./estates/estates.module");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const database_config_1 = require("./config/database.config");
const properties_module_1 = require("./properties/properties.module");
const initial_seeds_1 = require("./common/seeders/initial-seeds");
const user_entity_1 = require("./users/entities/user.entity");
const estate_entity_1 = require("./estates/entities/estate.entity");
const mail_service_1 = require("./common/services/mail.service");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const token_module_1 = require("./gatePassToken/token.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const notifications_module_1 = require("./notifications/notifications.module");
const events_module_1 = require("./events/events.module");
let AppModule = class AppModule {
    initialSeedService;
    constructor(initialSeedService) {
        this.initialSeedService = initialSeedService;
    }
    async onModuleInit() {
        await this.initialSeedService.seed();
    }
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes({
            path: '*',
            method: common_1.RequestMethod.ALL,
        });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const dbConfig = new database_config_1.DatabaseConfig(configService);
                    return dbConfig.getMongoConfig();
                },
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: user_entity_1.User.name, schema: user_entity_1.UserSchema },
                { name: estate_entity_1.Estate.name, schema: estate_entity_1.EstateSchema },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            estates_module_1.EstatesModule,
            properties_module_1.PropertiesModule,
            token_module_1.TokenModule,
            cloudinary_module_1.CloudinaryModule,
            notifications_module_1.NotificationsModule,
            events_module_1.EventsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, initial_seeds_1.InitialSeedService, mail_service_1.MailService],
    }),
    __metadata("design:paramtypes", [initial_seeds_1.InitialSeedService])
], AppModule);
//# sourceMappingURL=app.module.js.map