// import { Module } from '@nestjs/common';
// import { EstatesService } from './estates.service';
// import { EstatesController } from './estates.controller';

// @Module({
//   controllers: [EstatesController],
//   providers: [EstatesService],
// })
// export class EstatesModule {}

// src/estates/estates.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EstatesService } from './estates.service';
import { EstatesController } from './estates.controller';
import { Estate, EstateSchema } from './entities/estate.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Estate.name, schema: EstateSchema }]),
  ],
  controllers: [EstatesController],
  providers: [EstatesService],
  exports: [EstatesService],
})
export class EstatesModule {}
