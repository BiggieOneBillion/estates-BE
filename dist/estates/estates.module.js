"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstatesModule = exports.QueryHandlers = exports.CommandHandlers = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cqrs_1 = require("@nestjs/cqrs");
const estates_service_1 = require("./estates.service");
const estates_controller_1 = require("./estates.controller");
const estate_entity_1 = require("./entities/estate.entity");
const user_entity_1 = require("../users/entities/user.entity");
const users_service_1 = require("../users/users.service");
const mail_service_1 = require("../common/services/mail.service");
const create_estate_handler_1 = require("./cqrs/commands/handlers/create-estate.handler");
const update_estate_handler_1 = require("./cqrs/commands/handlers/update-estate.handler");
const delete_estate_handler_1 = require("./cqrs/commands/handlers/delete-estate.handler");
const find_all_estates_handler_1 = require("./cqrs/queries/handlers/find-all-estates.handler");
const find_estate_by_id_handler_1 = require("./cqrs/queries/handlers/find-estate-by-id.handler");
exports.CommandHandlers = [
    create_estate_handler_1.CreateEstateHandler,
    update_estate_handler_1.UpdateEstateHandler,
    delete_estate_handler_1.DeleteEstateHandler,
];
exports.QueryHandlers = [
    find_all_estates_handler_1.FindAllEstatesHandler,
    find_estate_by_id_handler_1.FindEstateByIdHandler,
];
let EstatesModule = class EstatesModule {
};
exports.EstatesModule = EstatesModule;
exports.EstatesModule = EstatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            mongoose_1.MongooseModule.forFeature([{ name: estate_entity_1.Estate.name, schema: estate_entity_1.EstateSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: user_entity_1.User.name, schema: user_entity_1.UserSchema }]),
        ],
        controllers: [estates_controller_1.EstatesController],
        providers: [
            estates_service_1.EstatesService,
            users_service_1.UsersService,
            mail_service_1.MailService,
            ...exports.CommandHandlers,
            ...exports.QueryHandlers,
        ],
        exports: [estates_service_1.EstatesService],
    })
], EstatesModule);
//# sourceMappingURL=estates.module.js.map