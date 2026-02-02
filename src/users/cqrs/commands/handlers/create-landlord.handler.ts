import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLandlordCommand } from '../impl/create-landlord.command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { ForbiddenException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { UserAccountCreatedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(CreateLandlordCommand)
export class CreateLandlordHandler implements ICommandHandler<CreateLandlordCommand> {
  private readonly logger = new Logger(CreateLandlordHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateLandlordCommand): Promise<User> {
    const { requesterId, landlordData } = command;

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

    const newLandlord = new this.userModel({
      ...landlordData,
      password: hashedPassword,
      primaryRole: UserRole.LANDLORD,
      estateId,
      hierarchy: {
        createdBy: requesterId,
        reportsTo: requesterId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: true,
    });

    await newLandlord.save();

    // Send event
    const event = new UserAccountCreatedEvent({
      userId: (newLandlord as any)._id.toString(),
      email: newLandlord.email,
      firstName: newLandlord.firstName,
      lastName: newLandlord.lastName,
      password,
    });
    await this.eventPublisher.publish(event);

    // Update managed users
    await this.userModel.findByIdAndUpdate(requesterId, {
      $addToSet: { 'hierarchy.manages': newLandlord._id },
    });

    return newLandlord;
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
