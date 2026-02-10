"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = exports.QueryHandlers = exports.CommandHandlers = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cqrs_1 = require("@nestjs/cqrs");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_entity_1 = require("./entities/user.entity");
const user_management_service_1 = require("./user-management.service");
const events_infrastructure_module_1 = require("../common/events/events-infrastructure.module");
const create_admin_handler_1 = require("./cqrs/commands/handlers/create-admin.handler");
const create_landlord_handler_1 = require("./cqrs/commands/handlers/create-landlord.handler");
const create_tenant_handler_1 = require("./cqrs/commands/handlers/create-tenant.handler");
const create_security_handler_1 = require("./cqrs/commands/handlers/create-security.handler");
const create_user_handler_1 = require("./cqrs/commands/handlers/create-user.handler");
const update_user_handler_1 = require("./cqrs/commands/handlers/update-user.handler");
const delete_user_handler_1 = require("./cqrs/commands/handlers/delete-user.handler");
const update_user_permissions_handler_1 = require("./cqrs/commands/handlers/update-user-permissions.handler");
const disable_token_generation_handler_1 = require("./cqrs/commands/handlers/disable-token-generation.handler");
const enable_token_generation_handler_1 = require("./cqrs/commands/handlers/enable-token-generation.handler");
const register_fcm_token_handler_1 = require("./cqrs/commands/handlers/register-fcm-token.handler");
const remove_fcm_token_handler_1 = require("./cqrs/commands/handlers/remove-fcm-token.handler");
const update_notification_preferences_handler_1 = require("./cqrs/commands/handlers/update-notification-preferences.handler");
const promote_landlord_to_admin_handler_1 = require("./cqrs/commands/handlers/promote-landlord-to-admin.handler");
const remove_admin_role_handler_1 = require("./cqrs/commands/handlers/remove-admin-role.handler");
const find_user_by_id_handler_1 = require("./cqrs/queries/handlers/find-user-by-id.handler");
const find_by_estate_handler_1 = require("./cqrs/queries/handlers/find-by-estate.handler");
const find_by_email_handler_1 = require("./cqrs/queries/handlers/find-by-email.handler");
const find_security_by_estate_handler_1 = require("./cqrs/queries/handlers/find-security-by-estate.handler");
exports.CommandHandlers = [
    create_admin_handler_1.CreateAdminHandler,
    create_landlord_handler_1.CreateLandlordHandler,
    create_tenant_handler_1.CreateTenantHandler,
    create_security_handler_1.CreateSecurityHandler,
    create_user_handler_1.CreateUserHandler,
    update_user_handler_1.UpdateUserHandler,
    delete_user_handler_1.DeleteUserHandler,
    update_user_permissions_handler_1.UpdateUserPermissionsHandler,
    disable_token_generation_handler_1.DisableTokenGenerationHandler,
    enable_token_generation_handler_1.EnableTokenGenerationHandler,
    register_fcm_token_handler_1.RegisterFcmTokenHandler,
    remove_fcm_token_handler_1.RemoveFcmTokenHandler,
    update_notification_preferences_handler_1.UpdateNotificationPreferencesHandler,
    promote_landlord_to_admin_handler_1.PromoteLandlordToAdminHandler,
    remove_admin_role_handler_1.RemoveAdminRoleHandler,
];
exports.QueryHandlers = [
    find_user_by_id_handler_1.FindUserByIdHandler,
    find_by_estate_handler_1.FindByEstateHandler,
    find_by_email_handler_1.FindByEmailHandler,
    find_security_by_estate_handler_1.FindSecurityByEstateHandler,
];
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            mongoose_1.MongooseModule.forFeature([{ name: user_entity_1.User.name, schema: user_entity_1.UserSchema }]),
            events_infrastructure_module_1.EventsInfrastructureModule,
        ],
        controllers: [users_controller_1.UsersController],
        providers: [
            users_service_1.UsersService,
            user_management_service_1.UserManagementService,
            ...exports.CommandHandlers,
            ...exports.QueryHandlers,
        ],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map