import { IsArray, IsNotEmpty, IsOptional, IsMongoId, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePermissionDto } from './create-user.request.dto';

export class UpdatePermissionsBodyRequestDto {
  @ApiPropertyOptional({ type: [CreatePermissionDto], description: 'Base permissions' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  basePermissions?: CreatePermissionDto[];

  @ApiPropertyOptional({ type: [CreatePermissionDto], description: 'Explicitly granted permissions' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  grantedPermissions?: CreatePermissionDto[];

  @ApiPropertyOptional({ type: [CreatePermissionDto], description: 'Explicitly denied permissions' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  deniedPermissions?: CreatePermissionDto[];
}

export class UpdatePermissionsRequestDto {
  @ApiProperty({ type: UpdatePermissionsBodyRequestDto, description: 'Permissions to update' })
  @ValidateNested()
  @Type(() => UpdatePermissionsBodyRequestDto)
  @IsNotEmpty()
  permission: UpdatePermissionsBodyRequestDto;

  @ApiProperty({ example: '60d5ecb8b392d60015f86539', description: 'Target user ID' })
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
