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
import { UsersService } from './users.service';
import { CreateAdminDetailsDto, CreateUserDto } from './dto/create-user.dto';
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

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userManagement: UserManagementService,
  ) {}

  /**
   * Creates an admin user.
   * Only super admins and admins with the necessary permissions can create admin users.
   * Throws a ForbiddenException if the user does not have permission.
   */
  @Post('create/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createAdmins(@Body() createUserDto: CreateUserDto, @Request() req) {
    if (createUserDto.primaryRole !== UserRole.ADMIN) {
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
    if (!createUserDto.password) {
      // generate a random password that has uppercase letters, lowercase letters, numbers, symbol like @%&, and 8 character length
      createUserDto.password = generateStrongPassword();
    }

    return this.usersService.create(createUserDto, userId);
  }

  /**
   * Creates a landlord user.
   * Only super admins and admins with the necessary permissions can create landlord users.
   * Throws a ForbiddenException if the user does not have permission.
   */
  @Post('create/landlord')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createLandLord(
    @Body()
    createUserDto: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      ownedProperties?: string[];
      canCreateTenants?: boolean;
      primaryRole: UserRole;
    },
    @Request() req,
  ) {
    if (createUserDto.primaryRole !== UserRole.LANDLORD) {
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
    // return this.usersService.create(createUserDto, userId);
    return this.userManagement.createLandlord(
      userId,
      {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        phone: createUserDto.phone,
        canCreateTenants: createUserDto.canCreateTenants,
      },
      user.estateId!.toString(),
    );
  }

  /**
   * Creates a tenant user.
   * Only super admins, admins, and landlords with the necessary permissions can create tenant users.
   * Throws a ForbiddenException if the user does not have permission.
   */
  @Post('create/tenant')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LANDLORD)
  async createTenant(@Body() createUserDto: CreateUserDto, @Request() req) {
    if (createUserDto.primaryRole !== UserRole.TENANT) {
      throw new ForbiddenException('You can only create a tenant');
    }
    const { userId, roles } = req.user;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (roles === UserRole.ADMIN || roles === UserRole.LANDLORD) {
      if (
        createUserDto.primaryRole !== UserRole.TENANT ||
        createUserDto.tenantDetails?.landlordId !== userId
      ) {
        throw new ForbiddenException('You can only create tenants under you');
      }
    }
    return this.usersService.create(createUserDto, userId);
  }

  @Post('create/security')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createSecurity(
    @Body()
    createUserDto: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
    @Request() req,
  ) {
    // if (
    //   createUserDto.primaryRole === UserRole.LANDLORD ||
    //   createUserDto.primaryRole === UserRole.TENANT ||
    //   createUserDto.primaryRole === UserRole.ADMIN ||
    //   createUserDto.primaryRole === UserRole.SUPER_ADMIN ||
    //   createUserDto.primaryRole === UserRole.SITE_ADMIN
    // ) {
    //   throw new ForbiddenException(
    //     'You can only create a users that are not admins, landlord, or tenant',
    //   );
    // }
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
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        phone: createUserDto.phone,
      },
      user.estateId!.toString(),
    );
  }

  /**
   * Creates a general user.
   * Only super admins and admins with the necessary permissions can create general users.
   * Throws a ForbiddenException if the user does not have permission.
   */
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
    return this.usersService.create(createUserDto, userId);
  }

  /**
   * Retrieves all users.
   * Only super admins and admins can access this endpoint.
   */
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

  /**
   * Retrieves a specific user by ID.
   * Allows users to access their own profile.
   * Throws a ForbiddenException if the user does not have permission.
   */
  @Get(':id')
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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

      // check if user exist in super-admin estate, as super-admin cannot access another super-admin estate users
      if (req.user.roles === UserRole.SUPER_ADMIN) {
        //  GET USERS IN SUPER ADMIN ESTATE
        const user = await this.usersService.findOne(req.user.userId);

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const usersFromEstate = await this.usersService.findByEstate(
          user.estateId!.toString(),
        );
        // check if user exist in estate
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

  /**
   * Updates a specific user by ID.
   * Allows super_admin and admin  to update their own profile and others profile.
   * Throws a ForbiddenException if the user does not have permission.
   */
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

  /**
   * Updates a specific user by ID.
   * Allows users to update their own profile.
   * Throws a ForbiddenException if the user does not have permission.
   */
  @Patch(':id')
  userUpdateOwnProfile(
    @Param('id') id: string,
    @Body()
    updateUserDto: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      email?: string;
    },
    @Request() req,
  ) {
    if (id === req.user.userId) {
      return this.usersService.update(id, updateUserDto);
    }
    throw new ForbiddenException(
      'You do not have permission to update this resource',
    );
  }

  /**
   * Edits a user's details by ID.
   * This is a comprehensive update endpoint.
   * Only accessible by SUPER_ADMIN or ADMIN with appropriate permissions.
   *
   * @param id The ID of the user to be edited.
   * @param updateUserDto The data for updating the user.
   * @param req The incoming request object.
   * @returns The updated user document.
   */
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

    // Both SUPER_ADMIN and ADMIN can only update users within their own estate
    if (requester.estateId?.toString() !== userToUpdate.estateId?.toString()) {
      throw new ForbiddenException(
        'Cannot update users from a different estate.',
      );
    }

    // Admin role requires specific permission to update other users
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

  @Patch('update/to-admin/:id')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    // UserRole.ADMIN
  )
  async updateUserToAdmin(
    @Param('id') id: string,
    @Request() req,
    @Body() body: CreateAdminDetailsDto,
  ) {
    // if (req.user.roles === UserRole.ADMIN) {
    //   const requiredPermission = req.user.grantedPermissions!.filter(
    //     (permission) =>
    //       permission.actions.includes(PermissionAction.UPDATE) &&
    //       permission.resource === ResourceType.USERS,
    //   );
    //   if (requiredPermission.length === 0) {
    //     throw new ForbiddenException(
    //       'You do not have permission to update users',
    //     );
    //   }
    // }
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.estateId) {
      throw new NotFoundException('User does not have an estate');
    }
    // check if user exist in estate
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

  @Patch('update/demote-admin/:id')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    // UserRole.ADMIN
  )
  async demoteAdminToLandlord(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.estateId) {
      throw new NotFoundException('User does not have an estate');
    }
    // check if user exist in estate
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

  /**
   * Deletes a specific user by ID.
   * Only super admins can access this endpoint.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('update/permission/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updatePermissions(
    @Body()
    body: {
      permission: {
        basePermissions?: Permission[];
        grantedPermissions?: Permission[];
        deniedPermissions?: Permission[];
      };
      id: string; // this is the user id, id of the person receiving the update
    },
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

    // check if user exist in estate
    const userExist = usersFromEstate.find((user) => user.id === body.id);

    if (!userExist) {
      throw new NotFoundException(
        'User not found, Cannot access user in another estate',
      );
    }

    return this.userManagement.updateUserPermissions(body.id, body.permission);
  }

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

    // Find the target user
    const targetUser = await this.usersService.findOne(id);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Check if the target user belongs to the same estate as the super admin
    if (targetUser.estateId?.toString() !== superAdmin.estateId.toString()) {
      throw new ForbiddenException(
        'Cannot disable token generation for users from different estates',
      );
    }

    return this.usersService.disableTokenGeneration(id);
  }

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

    // Find the target user
    const targetUser = await this.usersService.findOne(id);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Check if the target user belongs to the same estate as the super admin
    if (targetUser.estateId?.toString() !== superAdmin.estateId.toString()) {
      throw new ForbiddenException(
        'Cannot enable token generation for users from different estates',
      );
    }

    return this.usersService.enableTokenGeneration(id);
  }
}
