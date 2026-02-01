"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesModule = exports.QueryHandlers = exports.CommandHandlers = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cqrs_1 = require("@nestjs/cqrs");
const properties_service_1 = require("./properties.service");
const properties_controller_1 = require("./properties.controller");
const property_entity_1 = require("./entities/property.entity");
const create_property_handler_1 = require("./cqrs/commands/handlers/create-property.handler");
const update_property_handler_1 = require("./cqrs/commands/handlers/update-property.handler");
const delete_property_handler_1 = require("./cqrs/commands/handlers/delete-property.handler");
const find_all_properties_handler_1 = require("./cqrs/queries/handlers/find-all-properties.handler");
const find_property_by_id_handler_1 = require("./cqrs/queries/handlers/find-property-by-id.handler");
exports.CommandHandlers = [
    create_property_handler_1.CreatePropertyHandler,
    update_property_handler_1.UpdatePropertyHandler,
    delete_property_handler_1.DeletePropertyHandler,
];
exports.QueryHandlers = [
    find_all_properties_handler_1.FindAllPropertiesHandler,
    find_property_by_id_handler_1.FindPropertyByIdHandler,
];
let PropertiesModule = class PropertiesModule {
};
exports.PropertiesModule = PropertiesModule;
exports.PropertiesModule = PropertiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            mongoose_1.MongooseModule.forFeature([{ name: property_entity_1.Property.name, schema: property_entity_1.PropertySchema }]),
        ],
        controllers: [properties_controller_1.PropertiesController],
        providers: [
            properties_service_1.PropertiesService,
            ...exports.CommandHandlers,
            ...exports.QueryHandlers,
        ],
        exports: [properties_service_1.PropertiesService],
    })
], PropertiesModule);
//# sourceMappingURL=properties.module.js.map