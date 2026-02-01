import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';

import { CreateUserRequestDto } from './dto/request/create-user.request.dto';
import { UpdateUserRequestDto } from './dto/request/update-user.request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AdminDetails,
  Permission,
  PermissionAction,
  ResourceType,
  User,
  UserRole,
} from './entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { generateStrongPassword } from 'src/common/utils/util-fn';
import { UserManagementService } from './user-management.service';
import { RegisterFcmTokenRequestDto, UpdateNotificationPreferencesRequestDto } from './dto/request/fcm-token.request.dto';
import { CreateLandlordRequestDto } from './dto/request/create-landlord.request.dto';
import { CreateSecurityRequestDto } from './dto/request/create-security.request.dto';
import { CreateTenantRequestDto } from './dto/request/create-tenant.request.dto';
import { CreateAdminRequestDto, CreateAdminDetailsDto } from './dto/request/create-admin.request.dto';
import { CreateSuperAdminRequestDto } from './dto/request/create-super-admin.request.dto';
import { UpdateProfileRequestDto } from './dto/request/update-profile.request.dto';
import { UpdatePermissionsRequestDto } from './dto/request/update-permissions.request.dto';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { UserResponseDto } from './dto/response/user.response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { User as UserEntity } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userManagement: UserManagementService,
  ) {}

  @ApiOperation({
    summary: 'Create an admin user',
    description: 'Allows Super Admins or Admins with CREATE_ADMINS permission to create a new admin.',
  })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/admin')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermission(ResourceType.ADMINS, PermissionAction.CREATE)
  async createAdmins(
    @Body() createAdminDto: CreateAdminRequestDto,
    @CurrentUser() user: any,
  ) {
    if (createAdminDto.primaryRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only create an admin user');
    }
    
    return this.userManagement.createAdmin(
      user.userId,
      {
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
        email: createAdminDto.email,
        phone: createAdminDto.phone,
        position: createAdminDto.adminDetails!.position,
        customPositionTitle: createAdminDto.adminDetails?.customPositionTitle,
        department: createAdminDto.adminDetails?.department,
        additionalPermissions: createAdminDto.adminDetails?.additionalPermissions,
      },
    );
  }

  @ApiOperation({
    summary: 'Create a landlord user',
    description: 'Allows Super Admins or Admins with CREATE_LANDLORDS permission to create a new landlord.',
  })
  @ApiResponse({ status: 201, description: 'Landlord created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/landlord')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermission(ResourceType.LANDLORDS, PermissionAction.CREATE)
  async createLandLord(
    @Body() createLandlordDto: CreateLandlordRequestDto,
    @CurrentUser('userId') userId: string,
  ) {
    if (createLandlordDto.primaryRole !== UserRole.LANDLORD) {
      throw new ForbiddenException('You can only create a landlord');
    }

    return this.userManagement.createLandlord(
      userId,
      {
        firstName: createLandlordDto.firstName,
        lastName: createLandlordDto.lastName,
        email: createLandlordDto.email,
        phone: createLandlordDto.phone,
        canCreateTenants: createLandlordDto.canCreateTenants,
      },
    );
  }

  @ApiOperation({
    summary: 'Create a tenant user',
    description: 'Allows Super Admins, Admins, or Landlords to create a new tenant under them.',
  })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/tenant')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LANDLORD)
  async createTenant(
    @Body() createTenantDto: CreateTenantRequestDto,
    @CurrentUser('userId') userId: string,
  ) {
    if (createTenantDto.primaryRole !== UserRole.TENANT) {
      throw new ForbiddenException('You can only create a tenant');
    }

    // Business logic: only landlord themselves or authorized admins can create tenants
    const targetLandlordId = createTenantDto.tenantDetails.landlordId;

    return this.userManagement.createTenant(
      targetLandlordId,
      {
        firstName: createTenantDto.firstName,
        lastName: createTenantDto.lastName,
        email: createTenantDto.email,
        phone: createTenantDto.phone,
        propertyUnit: createTenantDto.tenantDetails?.propertyUnit,
        leaseStartDate: createTenantDto.tenantDetails?.leaseStartDate
          ? new Date(createTenantDto.tenantDetails.leaseStartDate)
          : undefined,
        leaseEndDate: createTenantDto.tenantDetails?.leaseEndDate
          ? new Date(createTenantDto.tenantDetails.leaseEndDate)
          : undefined,
      },
    );
  }

  @ApiOperation({
    summary: 'Create a security user',
    description: 'Allows Super Admins or Admins with CREATE_USERS permission to create a new security user.',
  })
  @ApiResponse({ status: 201, description: 'Security user created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/security')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermission(ResourceType.USERS, PermissionAction.CREATE)
  async createSecurity(
    @Body() createSecurityDto: CreateSecurityRequestDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.userManagement.createSecurity(
      userId,
      {
        firstName: createSecurityDto.firstName,
        lastName: createSecurityDto.lastName,
        email: createSecurityDto.email,
        phone: createSecurityDto.phone,
      },
    );
  }

  // @ApiOperation({
  //   summary: 'Create a general user',
  //   description: 'Allows Super Admins or Admins with CREATE_USERS permission to create a general user (non-admin, non-landlord, non-tenant).',
  // })
  // @ApiResponse({ status: 201, description: 'User created successfully' })
  // @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  // @Post('create/user')
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  // async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
  //   if (
  //     createUserDto.primaryRole === UserRole.LANDLORD ||
  //     createUserDto.primaryRole === UserRole.TENANT ||
  //     createUserDto.primaryRole === UserRole.ADMIN ||
  //     createUserDto.primaryRole === UserRole.SUPER_ADMIN ||
  //     createUserDto.primaryRole === UserRole.SITE_ADMIN
  //   ) {
  //     throw new ForbiddenException(
  //       'You can only create a users that are not admins, landlord, or tenant',
  //     );
  //   }
  //   const { userId, roles } = req.user;
  //   const user = await this.usersService.findOne(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   if (roles === UserRole.ADMIN) {
  //     if (!user.grantedPermissions) {
  //       throw new ForbiddenException(
  //         'You do not have permission to create users',
  //       );
  //     }
  //     const requiredPermission = user.grantedPermissions!.filter(
  //       (permission) =>
  //         permission.actions.includes(PermissionAction.CREATE) &&
  //         permission.resource === ResourceType.USERS,
  //     );
  //     if (requiredPermission.length === 0) {
  //       throw new ForbiddenException(
  //         'You do not have permission to create users',
  //       );
  //     }
  //   }
  //   return this.userManagement.createUser(
  //     userId,
  //     createUserDto,
  //     user.estateId!.toString(),
  //   );
  // }

  @ApiOperation({
    summary: 'Get all users in the estate',
    description: 'Allows Super Admins or Admins with READ_USERS permission to view all users in their estate.',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @Get('all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermission(ResourceType.USERS, PermissionAction.READ)
  async findAll(@CurrentUser('estate') estate: string) {
    console.log({estate});
    if (!estate) {
      throw new ForbiddenException('You must belong to an estate');
    }
    return this.usersService.findByEstate(estate.toString());
  }

  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Allows users to view their own profile, or Admins/Super Admins to view users in their estate.',
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    if (id === currentUser.userId) {
      return this.usersService.findOne(id);
    }

    // Admins and Super Admins can see others
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SITE_ADMIN].includes(currentUser.roles)) {
       // PermissionsGuard will handle granular check if we wanted it, but findOne is usually basic.
       // We should still ensure estate scope.
       const targetUser = await this.usersService.findOne(id);
       if (currentUser.roles !== UserRole.SUPER_ADMIN && targetUser.estateId?.toString() !== currentUser.estate?._id?.toString()) {
         throw new ForbiddenException('Cannot access users from a different estate');
       }
       return targetUser;
    }

    throw new ForbiddenException('You do not have permission to access this resource');
  }

  @ApiOperation({
    summary: 'Full update of a user',
    description: 'Allows Super Admins or Admins with UPDATE_USERS permission to perform a full update on a user.',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @Patch('full-update/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserRequestDto,
    @Request() req,
  ) {
    if (
      id === req.user.userId ||
      req.user.roles === UserRole.SUPER_ADMIN ||
      req.user.roles === UserRole.ADMIN
    ) {
      if (req.user.roles === UserRole.ADMIN) {
        const requiredPermission = req.user.grantedPermissions!.filter(
          (permission) =>
            permission.actions.includes(PermissionAction.UPDATE) &&
            permission.resource === ResourceType.USERS,
        );
        if (requiredPermission.length === 0) {
          throw new ForbiddenException(
            'You do not have permission to update users',
          );
        }
      }
      return this.usersService.update(id, updateUserDto);
    }
    throw new ForbiddenException(
      'You do not have permission to update this resource',
    );
  }

  @ApiOperation({
    summary: 'Update own profile',
    description: 'Allows any authenticated user to update their own basic profile information.',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @Patch(':id')
  userUpdateOwnProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileRequestDto,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (id === currentUserId) {
      return this.usersService.update(id, updateProfileDto);
    }
    throw new ForbiddenException('You can only update your own profile here');
  }

  @ApiOperation({
    summary: 'Edit user details',
    description: 'Comprehensive update endpoint for Super Admins/Admins within their estate.',
  })
  @ApiResponse({ status: 200, description: 'User edited successfully' })
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermission(ResourceType.USERS, PermissionAction.UPDATE)
  async editUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserRequestDto,
    @CurrentUser() currentUser: any,
  ) {
    const userToUpdate = await this.usersService.findOne(id);
    
    if (currentUser.roles !== UserRole.SUPER_ADMIN && userToUpdate.estateId?.toString() !== currentUser.estate?._id?.toString()) {
      throw new ForbiddenException('Cannot update users from a different estate');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Promote user to Admin',
    description: 'Allows Super Admins to promote a landlord to an admin role.',
  })
  @ApiResponse({ status: 200, description: 'User promoted successfully' })
  @Patch('update/to-admin/:id')
  @Roles(UserRole.SUPER_ADMIN)
  async updateUserToAdmin(
    @Param('id') id: string,
    @CurrentUser('userId') currentUserId: string,
    @Body() body: CreateAdminDetailsDto,
  ) {
    return this.userManagement.makeLandlordAdmin(currentUserId, id, body);
  }

  @ApiOperation({
    summary: 'Demote Admin to Landlord',
    description: 'Allows Super Admins to remove admin role from a user.',
  })
  @ApiResponse({ status: 200, description: 'User demoted successfully' })
  @Patch('demote/to-landlord/:id')
  @Roles(UserRole.SUPER_ADMIN)
  async demoteAdminToLandlord(
    @Param('id') id: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    return this.userManagement.removeAdminRole(currentUserId, id);
  }

  @ApiOperation({
    summary: 'Delete a user',
    description: 'Allows Super Admins to permanently delete a user account.',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermission(ResourceType.USERS, PermissionAction.DELETE)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    const userToRemove = await this.usersService.findOne(id);

    if (currentUser.roles !== UserRole.SUPER_ADMIN && userToRemove.estateId?.toString() !== currentUser.estate?._id?.toString()) {
      throw new ForbiddenException('Cannot delete users from a different estate');
    }

    return this.usersService.remove(id);
  }

  @ApiOperation({
    summary: 'Update user permissions',
    description: 'Allows Super Admins to granularly update user permissions.',
  })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
  @Patch('permissions/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermission(ResourceType.ADMINS, PermissionAction.MANAGE)
  async updatePermissions(
    @Param('userId') userId: string,
    @Body() updatePermissionsDto: UpdatePermissionsRequestDto,
    @CurrentUser() currentUser: any,
  ) {
    const userToUpdate = await this.usersService.findOne(userId);
    
    if (currentUser.roles !== UserRole.SUPER_ADMIN && userToUpdate.estateId?.toString() !== currentUser.estate?._id?.toString()) {
      throw new ForbiddenException('Cannot update permissions for users in a different estate');
    }

    return this.userManagement.updateUserPermissions(
      userId,
      updatePermissionsDto.permission,
    );
  }

  @ApiOperation({
    summary: 'Disable token generation',
    description: 'Prevents a user from generating gate pass tokens.',
  })
  @ApiResponse({ status: 200, description: 'Token generation disabled' })
  @Patch('disable-token-generation/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async disableTokenGeneration(@Param('id') id: string, @Request() req) {
    const superAdmin = await this.usersService.findOne(req.user.userId);
    if (!superAdmin) {
      throw new NotFoundException('Super admin not found');
    }

    if (!superAdmin.estateId) {
      throw new NotFoundException('Super admin does not have an estate');
    }

    const targetUser = await this.usersService.findOne(id);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    if (targetUser.estateId?.toString() !== superAdmin.estateId.toString()) {
      throw new ForbiddenException(
        'Cannot disable token generation for users from different estates',
      );
    }

    return this.usersService.disableTokenGeneration(id);
  }

  @ApiOperation({
    summary: 'Enable token generation',
    description: 'Allows a user to generate gate pass tokens.',
  })
  @ApiResponse({ status: 200, description: 'Token generation enabled' })
  @Patch('enable-token-generation/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async enableTokenGeneration(@Param('id') id: string, @Request() req) {
    const superAdmin = await this.usersService.findOne(req.user.userId);
    if (!superAdmin) {
      throw new NotFoundException('Super admin not found');
    }

    if (!superAdmin.estateId) {
      throw new NotFoundException('Super admin does not have an estate');
    }

    const targetUser = await this.usersService.findOne(id);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    if (targetUser.estateId?.toString() !== superAdmin.estateId.toString()) {
      throw new ForbiddenException(
        'Cannot enable token generation for users from different estates',
      );
    }

    return this.usersService.enableTokenGeneration(id);
  }

  @ApiOperation({
    summary: 'Register FCM token',
    description: 'Register a Firebase Cloud Messaging token for push notifications',
  })
  @ApiResponse({ status: 200, description: 'FCM token registered successfully' })
  @Post('fcm-token')
  async registerFcmToken(
    @Body() registerFcmTokenDto: RegisterFcmTokenRequestDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.usersService.registerFcmToken(userId, registerFcmTokenDto.fcmToken);
  }

  @ApiOperation({
    summary: 'Remove FCM token',
    description: 'Remove a Firebase Cloud Messaging token (e.g., on logout)',
  })
  @ApiResponse({ status: 200, description: 'FCM token removed successfully' })
  @Delete('fcm-token/:token')
  async removeFcmToken(
    @Param('token') token: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.usersService.removeFcmToken(userId, token);
  }

  @ApiOperation({
    summary: 'Update notification preferences',
    description: 'Update user notification channel preferences',
  })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  @Patch('notification-preferences')
  async updateNotificationPreferences(
    @Body() updatePreferencesDto: UpdateNotificationPreferencesRequestDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.usersService.updateNotificationPreferences(userId, updatePreferencesDto);
  }

  @ApiOperation({
    summary: 'Get notification preferences',
    description: 'Get current user notification preferences',
  })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  @Get('notification-preferences/me')
  async getNotificationPreferences(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.findOne(userId);
    return {
      preferences: user.notificationPreferences || { email: true, push: true, sms: false },
    };
  }
}

