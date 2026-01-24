import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { EventsListener } from './events.listener';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, UsersModule, NotificationsModule],
  providers: [EventsGateway, EventsService, EventsListener],
  exports: [EventsService], // so app.controller can inject
})
export class EventsModule {}