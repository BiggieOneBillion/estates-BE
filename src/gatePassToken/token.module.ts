import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { Token, TokenSchema } from './entities/token.entity';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/common/services/mail.service';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsModule } from 'src/events/events.module';
import { ComplianceModule } from '../compliance/compliance.module';

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

export const CommandHandlers = [
  CreateTokenHandler,
  UpdateTokenHandler,
  VerifyTokenHandler,
  VerifyVisitorTokenHandler,
  DeleteTokenHandler,
];

export const QueryHandlers = [
  FindAllTokensHandler,
  FindTokensByUserHandler,
  FindTokensByEstateHandler,
  FindTokenByIdHandler,
  FindTokenByStringHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    CloudinaryModule,
    NotificationsModule,
    EventsModule,
    ComplianceModule,
  ],
  controllers: [TokenController],
  providers: [
    TokenService, 
    UsersService, 
    MailService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [TokenService],
})
export class TokenModule {}
