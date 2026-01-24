import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeviesService } from './levies.service';
import { LeviesController } from './levies.controller';
import { Levy, LevySchema } from './entities/levy.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Levy.name, schema: LevySchema }]),
    UsersModule,
  ],
  controllers: [LeviesController],
  providers: [LeviesService],
  exports: [LeviesService],
})
export class LeviesModule {}
