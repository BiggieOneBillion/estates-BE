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
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property, PropertySchema } from './entities/property.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
