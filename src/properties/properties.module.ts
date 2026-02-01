// import { Module } from '@nestjs/common';
// import { PropertiesService } from './properties.service';
// import { PropertiesController } from './properties.controller';

// @Module({
//   controllers: [PropertiesController],
//   providers: [PropertiesService],
// })
// export class PropertiesModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property, PropertySchema } from './entities/property.entity';

import { CreatePropertyHandler } from './cqrs/commands/handlers/create-property.handler';
import { UpdatePropertyHandler } from './cqrs/commands/handlers/update-property.handler';
import { DeletePropertyHandler } from './cqrs/commands/handlers/delete-property.handler';
import { FindAllPropertiesHandler } from './cqrs/queries/handlers/find-all-properties.handler';
import { FindPropertyByIdHandler } from './cqrs/queries/handlers/find-property-by-id.handler';

export const CommandHandlers = [
  CreatePropertyHandler,
  UpdatePropertyHandler,
  DeletePropertyHandler,
];

export const QueryHandlers = [
  FindAllPropertiesHandler,
  FindPropertyByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
  ],
  controllers: [PropertiesController],
  providers: [
    PropertiesService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [PropertiesService],
})
export class PropertiesModule {}
