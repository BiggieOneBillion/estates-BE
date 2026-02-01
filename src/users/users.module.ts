// import { Module } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { UsersController } from './users.controller';

// @Module({
//   controllers: [UsersController],
//   providers: [UsersService],
// })
// export class UsersModule {}

// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { UserManagementService } from './user-management.service';
import { EventsInfrastructureModule } from 'src/common/events/events-infrastructure.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EventsInfrastructureModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserManagementService],
  exports: [UsersService],
})
export class UsersModule {}
