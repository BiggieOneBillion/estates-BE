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
import { UserSchema, User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/common/services/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Estate.name, schema: EstateSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [EstatesController],
  providers: [EstatesService, UsersService, MailService],
  exports: [EstatesService],
})
export class EstatesModule {}
