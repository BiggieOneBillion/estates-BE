import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class NotificationPreferencesDto {
  @ApiProperty()
  email: boolean;

  @ApiProperty()
  push: boolean;

  @ApiProperty()
  sms: boolean;
}

class HierarchyDto {
  @ApiProperty()
  createdBy: string;

  @ApiProperty({ required: false })
  reportsTo?: string;

  @ApiProperty({ type: [String] })
  manages: string[];

  @ApiProperty()
  relationshipEstablishedAt: string;
}

class PermissionDto {
  @ApiProperty()
  @Expose()
  resource: string;

  @ApiProperty({ type: [String] })
  @Expose()
  actions: string[];

  @ApiProperty({ type: [String], required: false })
  @Expose()
  conditions?: string[];
}

class AdminDetailsDto {
  @ApiProperty()
  @Expose()
  position: string;

  @ApiProperty({ required: false })
  @Expose()
  customPositionTitle?: string;

  @ApiProperty({ required: false })
  @Expose()
  department?: string;
}

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  primaryRole: string;

  @ApiProperty({ type: NotificationPreferencesDto })
  @Expose()
  notificationPreferences: NotificationPreferencesDto;

  @ApiProperty({ required: false })
  @Expose()
  estateId?: string;

  @ApiProperty()
  @Expose()
  isTemporaryPassword: boolean;

  @ApiProperty()
  @Expose()
  canCreateToken: boolean;

  @ApiProperty({ type: HierarchyDto })
  @Expose()
  hierarchy: HierarchyDto;

  @ApiProperty({ type: [PermissionDto] })
  @Expose()
  @Type(() => PermissionDto)
  basePermissions: PermissionDto[];

  @ApiProperty({ type: [PermissionDto] })
  @Expose()
  @Type(() => PermissionDto)
  grantedPermissions: PermissionDto[];

  @ApiProperty({ type: [PermissionDto] })
  @Expose()
  @Type(() => PermissionDto)
  deniedPermissions: PermissionDto[];

  @ApiProperty({ type: AdminDetailsDto, required: false })
  @Expose()
  @Type(() => AdminDetailsDto)
  adminDetails?: AdminDetailsDto;
}

export class VerifyLoginResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty()
  access_token: string;
}
