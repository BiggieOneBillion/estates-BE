// import { Module } from '@nestjs/common';
// import { EstatesService } from './estates.service';
// import { EstatesController } from './estates.controller';

// @Module({
//   controllers: [EstatesController],
//   providers: [EstatesService],
// })
// export class EstatesModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { EstatesService } from './estates.service';
import { EstatesController } from './estates.controller';
import { Estate, EstateSchema } from './entities/estate.entity';
import { UserSchema, User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/common/services/mail.service';

import { CreateEstateHandler } from './cqrs/commands/handlers/create-estate.handler';
import { UpdateEstateHandler } from './cqrs/commands/handlers/update-estate.handler';
import { DeleteEstateHandler } from './cqrs/commands/handlers/delete-estate.handler';
import { FindAllEstatesHandler } from './cqrs/queries/handlers/find-all-estates.handler';
import { FindEstateByIdHandler } from './cqrs/queries/handlers/find-estate-by-id.handler';

export const CommandHandlers = [
  CreateEstateHandler,
  UpdateEstateHandler,
  DeleteEstateHandler,
];

export const QueryHandlers = [
  FindAllEstatesHandler,
  FindEstateByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Estate.name, schema: EstateSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [EstatesController],
  providers: [
    EstatesService, 
    UsersService, 
    MailService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [EstatesService],
})
export class EstatesModule {}
