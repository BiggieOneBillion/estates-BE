import { AdminPosition, Permission } from '../../../entities/user.entity';

export class CreateAdminCommand {
  constructor(
    public readonly requesterId: string,
    public readonly adminData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      position: AdminPosition;
      customPositionTitle?: string;
      department?: string;
      additionalPermissions?: Permission[];
      existingLandlordId?: string;
    },
  ) {}
}
