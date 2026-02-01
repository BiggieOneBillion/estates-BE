import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { ForbiddenException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { UserAccountCreatedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { requesterId, userData } = command;

    const requester = await this.userModel.findById(requesterId);
    if (!requester) {
      throw new ForbiddenException('Requester not found');
    }

    const estateId = requester.estateId?.toString();
    const password = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
      estateId,
      hierarchy: {
        createdBy: requesterId,
        reportsTo: requesterId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: true,
    });

    await newUser.save();

    // Send event
    const event = new UserAccountCreatedEvent({
      userId: (newUser as any)._id.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      password,
    });
    await this.eventPublisher.publish(event);

    return newUser;
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
