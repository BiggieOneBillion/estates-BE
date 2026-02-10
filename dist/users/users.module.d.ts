import { CreateAdminHandler } from './cqrs/commands/handlers/create-admin.handler';
import { CreateLandlordHandler } from './cqrs/commands/handlers/create-landlord.handler';
import { CreateTenantHandler } from './cqrs/commands/handlers/create-tenant.handler';
import { CreateSecurityHandler } from './cqrs/commands/handlers/create-security.handler';
import { CreateUserHandler } from './cqrs/commands/handlers/create-user.handler';
import { UpdateUserHandler } from './cqrs/commands/handlers/update-user.handler';
import { DeleteUserHandler } from './cqrs/commands/handlers/delete-user.handler';
import { UpdateUserPermissionsHandler } from './cqrs/commands/handlers/update-user-permissions.handler';
import { DisableTokenGenerationHandler } from './cqrs/commands/handlers/disable-token-generation.handler';
import { EnableTokenGenerationHandler } from './cqrs/commands/handlers/enable-token-generation.handler';
import { RegisterFcmTokenHandler } from './cqrs/commands/handlers/register-fcm-token.handler';
import { RemoveFcmTokenHandler } from './cqrs/commands/handlers/remove-fcm-token.handler';
import { UpdateNotificationPreferencesHandler } from './cqrs/commands/handlers/update-notification-preferences.handler';
import { PromoteLandlordToAdminHandler } from './cqrs/commands/handlers/promote-landlord-to-admin.handler';
import { RemoveAdminRoleHandler } from './cqrs/commands/handlers/remove-admin-role.handler';
import { FindUserByIdHandler } from './cqrs/queries/handlers/find-user-by-id.handler';
import { FindByEstateHandler } from './cqrs/queries/handlers/find-by-estate.handler';
import { FindByEmailHandler } from './cqrs/queries/handlers/find-by-email.handler';
import { FindSecurityByEstateHandler } from './cqrs/queries/handlers/find-security-by-estate.handler';
export declare const CommandHandlers: (typeof CreateAdminHandler | typeof CreateLandlordHandler | typeof CreateTenantHandler | typeof CreateSecurityHandler | typeof CreateUserHandler | typeof UpdateUserHandler | typeof DeleteUserHandler | typeof UpdateUserPermissionsHandler | typeof DisableTokenGenerationHandler | typeof EnableTokenGenerationHandler | typeof RegisterFcmTokenHandler | typeof RemoveFcmTokenHandler | typeof UpdateNotificationPreferencesHandler | typeof PromoteLandlordToAdminHandler | typeof RemoveAdminRoleHandler)[];
export declare const QueryHandlers: (typeof FindUserByIdHandler | typeof FindByEstateHandler | typeof FindByEmailHandler | typeof FindSecurityByEstateHandler)[];
export declare class UsersModule {
}
