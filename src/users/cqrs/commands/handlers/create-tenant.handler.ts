import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTenantCommand } from '../impl/create-tenant.command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { ForbiddenException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { UserAccountCreatedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  private readonly logger = new Logger(CreateTenantHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateTenantCommand): Promise<User> {
    const { landlordId, tenantData } = command;

    const landlord = await this.userModel.findById(landlordId);
    if (!landlord) {
      throw new ForbiddenException('Landlord not found');
    }

    const estateId = landlord.estateId?.toString();
    const password = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTenant = new this.userModel({
      ...tenantData,
      password: hashedPassword,
      primaryRole: UserRole.TENANT,
      estateId,
      tenantDetails: {
        landlordId,
        propertyUnit: tenantData.propertyUnit,
        leaseStartDate: tenantData.leaseStartDate,
        leaseEndDate: tenantData.leaseEndDate,
      },
      hierarchy: {
        createdBy: landlordId,
        reportsTo: landlordId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: true,
    });

    await newTenant.save();

    // Send event
    const event = new UserAccountCreatedEvent({
      userId: (newTenant as any)._id.toString(),
      email: newTenant.email,
      firstName: newTenant.firstName,
      lastName: newTenant.lastName,
      password,
    });
    await this.eventPublisher.publish(event);

    // Update landlord's managed users
    await this.userModel.findByIdAndUpdate(landlordId, {
      $addToSet: { 'hierarchy.manages': newTenant._id },
    });

    return newTenant;
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
