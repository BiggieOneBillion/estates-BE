import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSecurityCommand } from '../impl/create-security.command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { ForbiddenException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { UserAccountCreatedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(CreateSecurityCommand)
export class CreateSecurityHandler implements ICommandHandler<CreateSecurityCommand> {
  private readonly logger = new Logger(CreateSecurityHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateSecurityCommand): Promise<User> {
    const { requesterId, securityData } = command;

    const requester = await this.userModel.findById(requesterId);
    if (!requester) {
      throw new ForbiddenException('Requester not found');
    }

    if (!requester.estateId && requester.primaryRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Requester must belong to an estate');
    }

    const estateId = requester.estateId?.toString();
    const password = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newSecurity = new this.userModel({
      ...securityData,
      password: hashedPassword,
      primaryRole: UserRole.SECURITY,
      estateId,
      hierarchy: {
        createdBy: requesterId,
        reportsTo: requesterId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: true,
    });

    await newSecurity.save();

    // Send event
    const event = new UserAccountCreatedEvent({
      userId: (newSecurity as any)._id.toString(),
      email: newSecurity.email,
      firstName: newSecurity.firstName,
      lastName: newSecurity.lastName,
      password,
    });
    await this.eventPublisher.publish(event);

    // Update managed users
    await this.userModel.findByIdAndUpdate(requesterId, {
      $addToSet: { 'hierarchy.manages': newSecurity._id },
    });

    return newSecurity;
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
