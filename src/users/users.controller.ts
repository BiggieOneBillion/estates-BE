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

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
import { RegisterFcmTokenDto, UpdateNotificationPreferencesDto } from './dto/fcm-token.dto';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { CreateSecurityDto } from './dto/create-security.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateAdminDto, CreateAdminDetailsDto } from './dto/create-admin.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createAdmins(@Body() createAdminDto: CreateAdminDto, @Request() req) {
    if (createAdminDto.primaryRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only create an admin user');
    }
    const { userId, roles } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (roles === UserRole.ADMIN) {
      if (!user.grantedPermissions) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
      const requiredPermission = user.grantedPermissions!.filter(
        (permission) =>
          permission.actions.includes(PermissionAction.CREATE) &&
          permission.resource === ResourceType.ADMINS,
      );
      if (requiredPermission.length === 0) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
    }
    return this.userManagement.createAdmin(
      userId,
      {
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
        email: createAdminDto.email,
        phone: createAdminDto.phone,
        position: createAdminDto.adminDetails!.position,
        customPositionTitle: createAdminDto.adminDetails?.customPositionTitle,
        department: createAdminDto.adminDetails?.department,
        additionalPermissions:
          createAdminDto.adminDetails?.additionalPermissions,
      },
      user.estateId!.toString(),
    );
  }

  @ApiOperation({
    summary: 'Create a landlord user',
    description: 'Allows Super Admins or Admins with CREATE_LANDLORDS permission to create a new landlord.',
  })
  @ApiResponse({ status: 201, description: 'Landlord created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/landlord')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createLandLord(
    @Body()
    createLandlordDto: CreateLandlordDto,
    @Request() req,
  ) {
    if (createLandlordDto.primaryRole !== UserRole.LANDLORD) {
      throw new ForbiddenException('You can only create a landlord');
    }
    const { userId, roles } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (roles === UserRole.ADMIN) {
      if (!user.grantedPermissions) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
      const requiredPermission = user.grantedPermissions!.filter(
        (permission) =>
          permission.actions.includes(PermissionAction.CREATE) &&
          permission.resource === ResourceType.LANDLORDS,
      );
      if (requiredPermission.length === 0) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
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
      user.estateId!.toString(),
    );
  }

  @ApiOperation({
    summary: 'Create a tenant user',
    description: 'Allows Super Admins, Admins, or Landlords to create a new tenant under them.',
  })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/tenant')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LANDLORD)
  async createTenant(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    if (createTenantDto.primaryRole !== UserRole.TENANT) {
      throw new ForbiddenException('You can only create a tenant');
    }
    const { userId, roles } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const targetLandlordId = createTenantDto.tenantDetails.landlordId;

    if (roles === UserRole.LANDLORD || roles === UserRole.ADMIN) {
      if (targetLandlordId !== userId && roles !== UserRole.SUPER_ADMIN) {
        // Simple admins can only create for themselves if they are landlords, 
        // or we need a more complex permission check. 
        // For now, let's stick to the original restriction or Super Admin power.
        const canCreateForOthers = roles === UserRole.ADMIN && 
          user.grantedPermissions?.some(p => p.resource === ResourceType.USERS && p.actions.includes(PermissionAction.CREATE));
        
        if (!canCreateForOthers && targetLandlordId !== userId) {
          throw new ForbiddenException('You can only create tenants under your own account');
        }
      }
    }

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
      user.estateId!.toString(),
    );
  }

  @ApiOperation({
    summary: 'Create a security user',
    description: 'Allows Super Admins or Admins with CREATE_USERS permission to create a new security user.',
  })
  @ApiResponse({ status: 201, description: 'Security user created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/security')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createSecurity(
    @Body()
    createSecurityDto: CreateSecurityDto,
    @Request() req,
  ) {
    const { userId, roles } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (roles === UserRole.ADMIN) {
      if (!user.grantedPermissions) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
      const requiredPermission = user.grantedPermissions!.filter(
        (permission) =>
          permission.actions.includes(PermissionAction.CREATE) &&
          permission.resource === ResourceType.USERS,
      );
      if (requiredPermission.length === 0) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
    }
    return this.userManagement.createSecurity(
      userId,
      {
        firstName: createSecurityDto.firstName,
        lastName: createSecurityDto.lastName,
        email: createSecurityDto.email,
        phone: createSecurityDto.phone,
      },
      user.estateId!.toString(),
    );
  }

  @ApiOperation({
    summary: 'Create a general user',
    description: 'Allows Super Admins or Admins with CREATE_USERS permission to create a general user (non-admin, non-landlord, non-tenant).',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  @Post('create/user')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
    if (
      createUserDto.primaryRole === UserRole.LANDLORD ||
      createUserDto.primaryRole === UserRole.TENANT ||
      createUserDto.primaryRole === UserRole.ADMIN ||
      createUserDto.primaryRole === UserRole.SUPER_ADMIN ||
      createUserDto.primaryRole === UserRole.SITE_ADMIN
    ) {
      throw new ForbiddenException(
        'You can only create a users that are not admins, landlord, or tenant',
      );
    }
    const { userId, roles } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (roles === UserRole.ADMIN) {
      if (!user.grantedPermissions) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
      const requiredPermission = user.grantedPermissions!.filter(
        (permission) =>
          permission.actions.includes(PermissionAction.CREATE) &&
          permission.resource === ResourceType.USERS,
      );
      if (requiredPermission.length === 0) {
        throw new ForbiddenException(
          'You do not have permission to create users',
        );
      }
    }
    return this.userManagement.createUser(
      userId,
      createUserDto,
      user.estateId!.toString(),
    );
  }

  @ApiOperation({
    summary: 'Get all users in the estate',
    description: 'Allows Super Admins or Admins with READ_USERS permission to view all users in their estate.',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(@Request() req) {
    const { userId, roles } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user && !user.estateId) {
      throw new NotFoundException('User does not have an estate');
    }

    if (roles === UserRole.ADMIN) {
      if (!user.grantedPermissions) {
        throw new ForbiddenException(
          'You do not have permission to access users data',
        );
      }
      const requiredPermission = user.grantedPermissions!.filter(
        (permission) =>
          permission.actions.includes(PermissionAction.MANAGE) ||
          (permission.actions.includes(PermissionAction.READ) &&
            permission.resource === ResourceType.USERS),
      );
      if (requiredPermission.length === 0) {
        throw new ForbiddenException(
          'You do not have permission to access users data',
        );
      }
    }

    return this.usersService.findByEstate(user.estateId!.toString());
  }

  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Allows users to view their own profile, or Admins/Super Admins to view users in their estate.',
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    if (
      id === req.user.userId ||
      req.user.roles.includes(UserRole.SUPER_ADMIN) ||
      req.user.roles.includes(UserRole.ADMIN)
    ) {
      if (req.user.roles === UserRole.ADMIN) {
        const requiredPermission = req.user.grantedPermissions!.filter(
          (permission) =>
            permission.actions.includes(PermissionAction.READ) &&
            permission.resource === ResourceType.USERS,
        );
        if (requiredPermission.length === 0) {
          throw new ForbiddenException('Cannot view users details');
        }
      }

      if (req.user.roles === UserRole.SUPER_ADMIN) {
        const user = await this.usersService.findOne(req.user.userId);

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const usersFromEstate = await this.usersService.findByEstate(
          user.estateId!.toString(),
        );
        const userExist = usersFromEstate.find((user) => user.id === id);

        if (!userExist) {
          throw new NotFoundException(
            'User not found, Cannot access user in another estate',
          );
        }

        return this.usersService.findOne(id);
      }

      return this.usersService.findOne(id);
    }
    throw new ForbiddenException(
      'You do not have permission to access this resource',
    );
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
    @Body() updateUserDto: UpdateUserDto,
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
    @Body()
    updateProfileDto: UpdateProfileDto,
    @Request() req,
  ) {
    if (id === req.user.userId) {
      return this.usersService.update(id, updateProfileDto);
    }
    throw new ForbiddenException(
      'You do not have permission to update this resource',
    );
  }

  @ApiOperation({
    summary: 'Edit user details',
    description: 'Comprehensive update endpoint for Super Admins/Admins within their estate.',
  })
  @ApiResponse({ status: 200, description: 'User edited successfully' })
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async editUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const { userId, roles } = req.user;

    const requester = await this.usersService.findOne(userId);
    if (!requester) {
      throw new NotFoundException('Requesting user not found.');
    }

    const userToUpdate = await this.usersService.findOne(id);
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    if (requester.estateId?.toString() !== userToUpdate.estateId?.toString()) {
      throw new ForbiddenException(
        'Cannot update users from a different estate.',
      );
    }

    if (
      roles === UserRole.ADMIN &&
      id !== userId &&
      !requester.grantedPermissions?.some(
        (p) =>
          p.resource === ResourceType.USERS &&
          p.actions.includes(PermissionAction.UPDATE),
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to update other users.',
      );
    }

    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Promote user to Admin',
    description: 'Allows Super Admins to promote a landlord to an admin role.',
  })
  @ApiResponse({ status: 200, description: 'User promoted successfully' })
  @Patch('update/to-admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateUserToAdmin(
    @Param('id') id: string,
    @Request() req,
    @Body() body: CreateAdminDetailsDto,
  ) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.estateId) {
      throw new NotFoundException('User does not have an estate');
    }
    const userInEstate = await this.usersService.findByEstate(
      user.estateId!.toString(),
    );

    const userExistInEstate = userInEstate.find((user) => user.id === id);

    if (!userExistInEstate) {
      throw new NotFoundException(
        'User not found, Cannot access user in another estate',
      );
    }

    return this.userManagement.makeLandlordAdmin(req.user.userId, id, body);
  }

  @ApiOperation({
    summary: 'Demote Admin to Landlord',
    description: 'Allows Super Admins to remove admin role from a user.',
  })
  @ApiResponse({ status: 200, description: 'User demoted successfully' })
  @Patch('update/demote-admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async demoteAdminToLandlord(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.estateId) {
      throw new NotFoundException('User does not have an estate');
    }
    const userInEstate = await this.usersService.findByEstate(
      user.estateId!.toString(),
    );

    const userExistInEstate = userInEstate.find((user) => user.id === id);

    if (!userExistInEstate) {
      throw new NotFoundException(
        'User not found, Cannot access user in another estate',
      );
    }

    return this.userManagement.removeAdminRole(req.user.userId, id);
  }

  @ApiOperation({
    summary: 'Delete a user',
    description: 'Allows Super Admins to permanently delete a user account.',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiOperation({
    summary: 'Update user permissions',
    description: 'Allows Super Admins to granularly update user permissions.',
  })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
  @Post('update/permission/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updatePermissions(
    @Body()
    updatePermissionsDto: UpdatePermissionsDto,
    @Request() req,
  ) {
    const { userId } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let usersFromEstate: User[] | undefined;

    try {
      usersFromEstate = await this.usersService.findByEstate(
        user.estateId!.toString(),
      );
    } catch {
      throw new NotFoundException('User does not have an estate');
    }

    const userExist = usersFromEstate.find((user) => user.id === updatePermissionsDto.id);

    if (!userExist) {
      throw new NotFoundException(
        'User not found, Cannot access user in another estate',
      );
    }

    return this.userManagement.updateUserPermissions(updatePermissionsDto.id, updatePermissionsDto.permission);
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
    @Body() registerFcmTokenDto: RegisterFcmTokenDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.usersService.registerFcmToken(userId, registerFcmTokenDto.fcmToken);
  }

  @ApiOperation({
    summary: 'Remove FCM token',
    description: 'Remove a Firebase Cloud Messaging token (e.g., on logout)',
  })
  @ApiResponse({ status: 200, description: 'FCM token removed successfully' })
  @Delete('fcm-token/:token')
  async removeFcmToken(@Param('token') token: string, @Request() req) {
    const userId = req.user.userId;
    return this.usersService.removeFcmToken(userId, token);
  }

  @ApiOperation({
    summary: 'Update notification preferences',
    description: 'Update user notification channel preferences',
  })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  @Patch('notification-preferences')
  async updateNotificationPreferences(
    @Body() updatePreferencesDto: UpdateNotificationPreferencesDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.usersService.updateNotificationPreferences(userId, updatePreferencesDto);
  }

  @ApiOperation({
    summary: 'Get notification preferences',
    description: 'Get current user notification preferences',
  })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  @Get('notification-preferences/me')
  async getNotificationPreferences(@Request() req) {
    const userId = req.user.userId;
    const user = await this.usersService.findOne(userId);
    return {
      preferences: user.notificationPreferences || { email: true, push: true, sms: false },
    };
  }
}

