import { CreatePropertyHandler } from './cqrs/commands/handlers/create-property.handler';
import { UpdatePropertyHandler } from './cqrs/commands/handlers/update-property.handler';
import { DeletePropertyHandler } from './cqrs/commands/handlers/delete-property.handler';
import { FindAllPropertiesHandler } from './cqrs/queries/handlers/find-all-properties.handler';
import { FindPropertyByIdHandler } from './cqrs/queries/handlers/find-property-by-id.handler';
export declare const CommandHandlers: (typeof CreatePropertyHandler | typeof UpdatePropertyHandler | typeof DeletePropertyHandler)[];
export declare const QueryHandlers: (typeof FindAllPropertiesHandler | typeof FindPropertyByIdHandler)[];
export declare class PropertiesModule {
}
