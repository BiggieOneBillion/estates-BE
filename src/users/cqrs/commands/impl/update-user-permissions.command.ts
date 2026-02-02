import { Permission } from '../../../entities/user.entity';

export class UpdateUserPermissionsCommand {
  constructor(
    public readonly userId: string,
    public readonly permissions: {
      basePermissions?: Permission[];
      grantedPermissions?: Permission[];
      deniedPermissions?: Permission[];
    },
  ) {}
}
