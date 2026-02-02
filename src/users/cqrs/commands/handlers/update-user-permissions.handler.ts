import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserPermissionsCommand } from '../impl/update-user-permissions.command';
import { InjectModel } from '@nestjs/mongoose';
import { User, Permission } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(UpdateUserPermissionsCommand)
export class UpdateUserPermissionsHandler implements ICommandHandler<UpdateUserPermissionsCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: UpdateUserPermissionsCommand): Promise<User> {
    const { userId, permissions } = command;
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    let deniedPermissions = [...(user.deniedPermissions || []), ...(permissions.deniedPermissions || [])];

    if (permissions.basePermissions) {
      const mergedBase = [...(user.basePermissions || []), ...permissions.basePermissions];
      user.basePermissions = this.filterOutDeniedPermissions(this.removeDuplicatePermissions(mergedBase), deniedPermissions);
    }

    if (permissions.grantedPermissions) {
      const mergedGranted = [...(user.grantedPermissions || []), ...permissions.grantedPermissions];
      user.grantedPermissions = this.removeDuplicatePermissions(mergedGranted);
    }

    await user.save();
    return user;
  }

  private removeDuplicatePermissions(permissions: Permission[]): Permission[] {
    const unique = new Map<string, Permission>();
    permissions.forEach((p) => {
      const key = `${p.resource}-${p.actions.sort().join(',')}`;
      unique.set(key, p);
    });
    return Array.from(unique.values());
  }

  private filterOutDeniedPermissions(permissions: Permission[], denied: Permission[]): Permission[] {
    return permissions.filter((p) => !denied.some((d) => d.resource === p.resource));
  }
}
