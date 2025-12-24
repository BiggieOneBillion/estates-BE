// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [EventsGateway, EventsService],
  exports: [EventsService], // so app.controller can inject
})
export class EventsModule {}