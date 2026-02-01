import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { CreateTokenNotificationCommand, CreateNotificationCommand } from '../impl/notification-commands.impl';
import { NotificationType } from '../../../entities/notification.entity';

@CommandHandler(CreateTokenNotificationCommand)
export class CreateTokenNotificationHandler implements ICommandHandler<CreateTokenNotificationCommand> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: CreateTokenNotificationCommand): Promise<any> {
    const { userId, tokenId, tokenValue, type, isVisitorIdVerified } = command;
    let message = '';

    switch (type) {
      case NotificationType.VERIFY_VISTOR:
        message = `Please verify the visitor id with this token ${tokenValue}`;
        break;
      case NotificationType.VISITOR_VERIFIED:
        message = `Visitor has been verify for this token ${tokenValue}`;
        break;
      case NotificationType.TOKEN_UPDATED:
        if (isVisitorIdVerified) {
          message = `Please verify the visitor id with this token ${tokenValue}`;
        } else {
          message = `Your token ${tokenValue} has been updated`;
        }
        break;
      case NotificationType.TOKEN_VERIFIED:
        message = `Your token ${tokenValue} has been verified`;
        break;
      case NotificationType.TOKEN_EXPIRED:
        message = `Your token ${tokenValue} has expired`;
        break;
    }

    const notification = {
      user: userId,
      type,
      message,
      data: { tokenId, tokenValue },
      read: false,
    };

    return this.commandBus.execute(new CreateNotificationCommand(notification));
  }
}
