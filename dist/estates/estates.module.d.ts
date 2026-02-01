import { CreateEstateHandler } from './cqrs/commands/handlers/create-estate.handler';
import { UpdateEstateHandler } from './cqrs/commands/handlers/update-estate.handler';
import { DeleteEstateHandler } from './cqrs/commands/handlers/delete-estate.handler';
import { FindAllEstatesHandler } from './cqrs/queries/handlers/find-all-estates.handler';
import { FindEstateByIdHandler } from './cqrs/queries/handlers/find-estate-by-id.handler';
export declare const CommandHandlers: (typeof CreateEstateHandler | typeof UpdateEstateHandler | typeof DeleteEstateHandler)[];
export declare const QueryHandlers: (typeof FindAllEstatesHandler | typeof FindEstateByIdHandler)[];
export declare class EstatesModule {
}
