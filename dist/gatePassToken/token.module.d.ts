import { CreateTokenHandler } from './cqrs/commands/handlers/create-token.handler';
import { UpdateTokenHandler } from './cqrs/commands/handlers/update-token.handler';
import { VerifyTokenHandler } from './cqrs/commands/handlers/verify-token.handler';
import { VerifyVisitorTokenHandler } from './cqrs/commands/handlers/verify-visitor-token.handler';
import { DeleteTokenHandler } from './cqrs/commands/handlers/delete-token.handler';
import { FindAllTokensHandler } from './cqrs/queries/handlers/find-all-tokens.handler';
import { FindTokensByUserHandler } from './cqrs/queries/handlers/find-tokens-by-user.handler';
import { FindTokensByEstateHandler } from './cqrs/queries/handlers/find-tokens-by-estate.handler';
import { FindTokenByIdHandler } from './cqrs/queries/handlers/find-token-by-id.handler';
import { FindTokenByStringHandler } from './cqrs/queries/handlers/find-token-by-string.handler';
export declare const CommandHandlers: (typeof CreateTokenHandler | typeof UpdateTokenHandler | typeof VerifyTokenHandler | typeof VerifyVisitorTokenHandler | typeof DeleteTokenHandler)[];
export declare const QueryHandlers: (typeof FindAllTokensHandler | typeof FindTokensByUserHandler | typeof FindTokensByEstateHandler | typeof FindTokenByIdHandler | typeof FindTokenByStringHandler)[];
export declare class TokenModule {
}
