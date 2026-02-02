import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAdminCommand } from '../impl/create-admin.command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  User, 
  UserRole, 
  AdminPosition, 
  Permission, 
  ResourceType, 
  PermissionAction 
} from '../../../entities/user.entity';
import { 
  ForbiddenException, 
  BadRequestException, 
  Logger 
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventPublisher } from 'src/common/events/services/event-publisher.service';
import { UserAccountCreatedEvent } from 'src/common/events/domain/user-events';

@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler implements ICommandHandler<CreateAdminCommand> {
  private readonly logger = new Logger(CreateAdminHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateAdminCommand): Promise<User> {
    const { requesterId, adminData } = command;

    // 1. Fetch requester and validate estate
    const requester = await this.userModel.findById(requesterId);
    if (!requester) {
      throw new ForbiddenException('Requester not found');
    }

    if (!requester.estateId && requester.primaryRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Requester must belong to an estate');
    }

    const estateId = requester.estateId?.toString();
    let newAdmin: User;

    if (adminData.existingLandlordId) {
      // Promote existing landlord to admin
      const landlord = await this.userModel.findById(adminData.existingLandlordId);
      if (!landlord || landlord.primaryRole !== UserRole.LANDLORD) {
        throw new BadRequestException('User must be a landlord to be promoted to admin');
      }

      const updatedAdmin = await this.userModel.findByIdAndUpdate(
        adminData.existingLandlordId,
        {
          primaryRole: UserRole.ADMIN,
          adminDetails: {
            position: adminData.position,
            customPositionTitle: adminData.customPositionTitle,
            department: adminData.department,
            positionPermissions: this.getPositionPermissions(adminData.position),
            additionalPermissions: adminData.additionalPermissions || [],
            appointedAt: new Date(),
            appointedBy: requesterId,
          },
          $push: {
            roleHistory: {
              fromRole: UserRole.LANDLORD,
              toRole: UserRole.ADMIN,
              changedBy: requesterId,
              changedAt: new Date(),
              reason: `Promoted to ${adminData.position}`,
            },
          },
        },
        { new: true },
      );

      newAdmin = updatedAdmin!;
    } else {
      // Create new admin user
      const password = this.generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      newAdmin = new this.userModel({
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        phone: adminData.phone,
        password: hashedPassword,
        primaryRole: UserRole.ADMIN,
        estateId,
        adminDetails: {
          position: adminData.position,
          customPositionTitle: adminData.customPositionTitle,
          department: adminData.department,
          positionPermissions: this.getPositionPermissions(adminData.position),
          additionalPermissions: adminData.additionalPermissions || [],
          appointedAt: new Date(),
          appointedBy: requesterId,
        },
        hierarchy: {
          createdBy: requesterId,
          reportsTo: requesterId,
          manages: [],
          relationshipEstablishedAt: new Date(),
        },
        isTemporaryPassword: true,
      });

      await newAdmin.save();

      const event = new UserAccountCreatedEvent({
        userId: (newAdmin as any)._id.toString(),
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        password,
      });

      await this.eventPublisher.publish(event);
    }

    // Update super admin's managed users
    await this.userModel.findByIdAndUpdate(requesterId, {
      $addToSet: { 'hierarchy.manages': newAdmin._id },
    });

    return newAdmin;
  }

  private getPositionPermissions(position: AdminPosition): Permission[] {
    const positionPermissions: Record<AdminPosition, Permission[]> = {
      [AdminPosition.SUPER_ADMIN]: [
        { resource: ResourceType.PROPERTIES, actions: [PermissionAction.MANAGE] },
        { resource: ResourceType.MAINTENANCE, actions: [PermissionAction.MANAGE] },
      ],
      [AdminPosition.FACILITY_MANAGER]: [
        { resource: ResourceType.PROPERTIES, actions: [PermissionAction.MANAGE] },
        { resource: ResourceType.MAINTENANCE, actions: [PermissionAction.MANAGE] },
      ],
      [AdminPosition.SECURITY_HEAD]: [
        { resource: ResourceType.SECURITY, actions: [PermissionAction.MANAGE] },
        { resource: ResourceType.USERS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
      ],
      [AdminPosition.FINANCE_MANAGER]: [
        { resource: ResourceType.FINANCES, actions: [PermissionAction.MANAGE] },
        { resource: ResourceType.REPORTS, actions: [PermissionAction.MANAGE] },
      ],
      [AdminPosition.TENANT_RELATIONS]: [
        { resource: ResourceType.TENANTS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
        { resource: ResourceType.MAINTENANCE, actions: [PermissionAction.READ, PermissionAction.ASSIGN] },
      ],
      [AdminPosition.MAINTENANCE_SUPERVISOR]: [],
      [AdminPosition.OPERATIONS_MANAGER]: [],
      [AdminPosition.PROPERTY_MANAGER]: [],
      [AdminPosition.CUSTOM]: [],
    };
    return positionPermissions[position] || [];
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
