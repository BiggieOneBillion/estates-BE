import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { LeviesService } from './levies.service';
import { LeviesController } from './levies.controller';
import { Levy, LevySchema } from './entities/levy.entity';
import { UsersModule } from '../users/users.module';
import { PaymentReminderService } from './payment-reminder.service';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailService } from '../common/services/mail.service';

import { CreateLevyHandler } from './cqrs/commands/handlers/create-levy.handler';
import { UpdateLevyHandler } from './cqrs/commands/handlers/update-levy.handler';
import { DeleteLevyHandler } from './cqrs/commands/handlers/delete-levy.handler';
import { FindAllLeviesHandler } from './cqrs/queries/handlers/find-all-levies.handler';
import { FindActiveLeviesHandler } from './cqrs/queries/handlers/find-active-levies.handler';
import { FindLevyByIdHandler } from './cqrs/queries/handlers/find-levy-by-id.handler';
import { GetEnforcedLeviesForUserHandler } from './cqrs/queries/handlers/get-enforced-levies-for-user.handler';
import { GetActiveLeviesForUserHandler } from './cqrs/queries/handlers/get-active-levies-for-user.handler';

export const CommandHandlers = [
  CreateLevyHandler,
  UpdateLevyHandler,
  DeleteLevyHandler,
];

export const QueryHandlers = [
  FindAllLeviesHandler,
  FindActiveLeviesHandler,
  FindLevyByIdHandler,
  GetEnforcedLeviesForUserHandler,
  GetActiveLeviesForUserHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Levy.name, schema: LevySchema }]),
    UsersModule,
    forwardRef(() => PaymentsModule),
    NotificationsModule,
  ],
  controllers: [LeviesController],
  providers: [
    LeviesService, 
    PaymentReminderService, 
    MailService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [LeviesService],
})
export class LeviesModule {}
