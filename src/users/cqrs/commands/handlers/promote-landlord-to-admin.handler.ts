import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PromoteLandlordToAdminCommand } from '../impl/promote-landlord-to-admin.command';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

@CommandHandler(PromoteLandlordToAdminCommand)
export class PromoteLandlordToAdminHandler implements ICommandHandler<PromoteLandlordToAdminCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: PromoteLandlordToAdminCommand): Promise<User> {
    const { requesterId, landlordId, adminDetails, reason } = command;

    const superAdmin = await this.userModel.findById(requesterId);
    if (!superAdmin || superAdmin.primaryRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can grant admin roles');
    }

    const landlord = await this.userModel.findById(landlordId);
    if (!landlord || landlord.primaryRole !== UserRole.LANDLORD) {
      throw new BadRequestException('User is not a landlord');
    }

    if (!landlord.landlordDetails?.isEligibleForAdmin) {
      throw new ForbiddenException('Landlord is not eligible for admin role');
    }

    const currentSecondaryRoles = landlord.secondaryRoles || [];
    const updatedSecondaryRoles = [
      ...new Set([
        ...currentSecondaryRoles.filter((role) => role !== UserRole.ADMIN),
        UserRole.LANDLORD,
      ]),
    ];

    const updatedUser = await this.userModel.findByIdAndUpdate(
      landlordId,
      {
        primaryRole: UserRole.ADMIN,
        secondaryRoles: updatedSecondaryRoles,
        $set: { adminDetails },
        $push: {
          roleHistory: {
            fromRole: UserRole.LANDLORD,
            toRole: UserRole.ADMIN,
            changedBy: requesterId,
            changedAt: new Date(),
            reason: reason || 'Landlord promoted to admin by super admin',
          },
        },
      },
      { new: true },
    );

    return updatedUser!;
  }
}
