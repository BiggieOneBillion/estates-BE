import { SetMetadata } from '@nestjs/common';
import { PermissionAction, ResourceType } from '../../users/entities/user.entity';

export interface RequiredPermission {
  resource: ResourceType;
  action: PermissionAction;
}

export const PERMISSION_KEY = 'permissions';
export const RequirePermission = (resource: ResourceType, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { resource, action });
