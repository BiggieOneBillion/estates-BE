// import { Module } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { UsersController } from './users.controller';

// @Module({
//   controllers: [UsersController],
//   providers: [UsersService],
// })
// export class UsersModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { UserManagementService } from './user-management.service';
import { EventsInfrastructureModule } from 'src/common/events/events-infrastructure.module';

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

export const CommandHandlers = [
  CreateAdminHandler,
  CreateLandlordHandler,
  CreateTenantHandler,
  CreateSecurityHandler,
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  UpdateUserPermissionsHandler,
  DisableTokenGenerationHandler,
  EnableTokenGenerationHandler,
  RegisterFcmTokenHandler,
  RemoveFcmTokenHandler,
  UpdateNotificationPreferencesHandler,
  PromoteLandlordToAdminHandler,
  RemoveAdminRoleHandler,
];

export const QueryHandlers = [
  FindUserByIdHandler,
  FindByEstateHandler,
  FindByEmailHandler,
  FindSecurityByEstateHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EventsInfrastructureModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService, 
    UserManagementService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [UsersService],
})
export class UsersModule {}
