import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveAdminRoleCommand } from '../impl/remove-admin-role.command';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

@CommandHandler(RemoveAdminRoleCommand)
export class RemoveAdminRoleHandler implements ICommandHandler<RemoveAdminRoleCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: RemoveAdminRoleCommand): Promise<User> {
    const { requesterId, adminId, reason } = command;

    const superAdmin = await this.userModel.findById(requesterId);
    if (!superAdmin || superAdmin.primaryRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can remove admin roles');
    }

    const admin = await this.userModel.findById(adminId);
    if (!admin || admin.primaryRole !== UserRole.ADMIN) {
      throw new BadRequestException('User is not an admin');
    }

    const updatedSecondaryRoles =
      admin.secondaryRoles?.filter((role) => role !== UserRole.LANDLORD) || [];

    const updatedUser = await this.userModel.findByIdAndUpdate(
      adminId,
      {
        primaryRole: UserRole.LANDLORD,
        secondaryRoles: updatedSecondaryRoles,
        $unset: { adminDetails: 1 },
        $set: {
          landlordDetails: {
            ownedProperties: [],
            tenants: [],
            canCreateTenants: true,
            isEligibleForAdmin: true,
          },
        },
        $push: {
          roleHistory: {
            fromRole: UserRole.ADMIN,
            toRole: UserRole.LANDLORD,
            changedBy: requesterId,
            changedAt: new Date(),
            reason: reason || 'Admin role removed by super admin',
          },
        },
      },
      { new: true },
    );

    return updatedUser!;
  }
}
