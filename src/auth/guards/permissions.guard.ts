import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import { UserRole, PermissionAction } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Site Admins and Super Admins have full access to everything in their scope
    if (user.roles === UserRole.SITE_ADMIN || user.roles === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check if user has the specific permission in their grantedPermissions
    const hasPermission = user.grantedPermissions?.some(
      (p) =>
        p.resource === requiredPermission.resource &&
        (p.actions.includes(requiredPermission.action) || p.actions.includes(PermissionAction.MANAGE))
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions: requires ${requiredPermission.action} on ${requiredPermission.resource}`,
      );
    }

    return true;
  }
}
