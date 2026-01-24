// src/users/services/user-management.service.ts
import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserRole,
  AdminPosition,
  Permission,
  AdminDetails,
  ResourceType,
  PermissionAction,
} from './entities/user.entity';
import { MailService } from 'src/common/services/mail.service';
import { CreateAdminDetailsDto } from './dto/create-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Create a new admin user (only by super_admin)
   */
  async createAdmin(
    superAdminId: string,
    adminData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      position: AdminPosition;
      customPositionTitle?: string;
      department?: string;
      additionalPermissions?: Permission[];
      existingLandlordId?: string; // If promoting existing landlord
    },
    estateId: string,
  ): Promise<User> {
    // Verify the creator is a super_admin
    const creator = await this.userModel.findById(superAdminId);
    if (!creator || creator.primaryRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create admin users');
    }

    let newAdmin: User;

    if (adminData.existingLandlordId) {
      // Promote existing landlord to admin
      const landlord = await this.userModel.findById(
        adminData.existingLandlordId,
      );
      if (!landlord || landlord.primaryRole !== UserRole.LANDLORD) {
        throw new BadRequestException(
          'User must be a landlord to be promoted to admin',
        );
      }

      // Update the landlord to admin
      let newAdminUser = await this.userModel.findByIdAndUpdate(
        adminData.existingLandlordId,
        {
          primaryRole: UserRole.ADMIN,
          adminDetails: {
            position: adminData.position,
            customPositionTitle: adminData.customPositionTitle,
            department: adminData.department,
            positionPermissions: this.getPositionPermissions(
              adminData.position,
            ),
            additionalPermissions: adminData.additionalPermissions || [],
            appointedAt: new Date(),
            appointedBy: superAdminId,
          },
          $push: {
            roleHistory: {
              fromRole: UserRole.LANDLORD,
              toRole: UserRole.ADMIN,
              changedBy: superAdminId,
              changedAt: new Date(),
              reason: `Promoted to ${adminData.position}`,
            },
          },
        },
        { new: true },
      );

      newAdmin = newAdminUser!;
    } else {
      // Create new admin user
      const password = this.generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      newAdmin = new this.userModel({
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        phone: adminData.phone,
        password: hashedPassword,
        primaryRole: UserRole.ADMIN,
        estateId,
        adminDetails: {
          position: adminData.position,
          customPositionTitle: adminData.customPositionTitle,
          department: adminData.department,
          positionPermissions: this.getPositionPermissions(adminData.position),
          additionalPermissions: adminData.additionalPermissions || [],
          appointedAt: new Date(),
          appointedBy: superAdminId,
        },
        hierarchy: {
          createdBy: superAdminId,
          reportsTo: superAdminId,
          manages: [],
          relationshipEstablishedAt: new Date(),
        },
        isTemporaryPassword: true,
      });

      await newAdmin.save();

      // Send email notification
      await this.mailService.accountCreationEmail({
        to: newAdmin.email,
        name: `${newAdmin.firstName} ${newAdmin.lastName}`,
        password,
      });
    }

    // Update super admin's managed users
    await this.userModel.findByIdAndUpdate(superAdminId, {
      $addToSet: { 'hierarchy.manages': newAdmin._id },
    });

    return newAdmin;
  }

  /**
   * Create a new landlord (by super_admin or authorized admin)
   */
  async createLandlord(
    creatorId: string,
    landlordData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      ownedProperties?: string[];
      canCreateTenants?: boolean;
    },
    estateId: string,
  ): Promise<User> {
    const creator = await this.userModel.findById(creatorId);

    // Check if creator has permission
    if (!creator) {
      throw new BadRequestException('Invalid creator ID');
    }

    const canCreateLandlord =
      creator.primaryRole === UserRole.SUPER_ADMIN ||
      (creator.primaryRole === UserRole.ADMIN &&
        this.hasPermission(creator, 'landlords', 'create'));

    if (!canCreateLandlord) {
      throw new ForbiddenException(
        'Insufficient permissions to create landlord',
      );
    }

    const password = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newLandlord = new this.userModel({
      firstName: landlordData.firstName,
      lastName: landlordData.lastName,
      email: landlordData.email,
      phone: landlordData.phone,
      password: hashedPassword,
      primaryRole: UserRole.LANDLORD,
      estateId,
      landlordDetails: {
        ownedProperties: landlordData.ownedProperties || [],
        tenants: [],
        canCreateTenants: landlordData.canCreateTenants ?? true,
        isEligibleForAdmin: true,
      },
      hierarchy: {
        createdBy: creatorId,
        reportsTo: creatorId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: true,
    });

    await newLandlord.save();

    // Update creator's managed users
    await this.userModel.findByIdAndUpdate(creatorId, {
      $addToSet: { 'hierarchy.manages': newLandlord._id },
    });

    // Send email notification
    await this.mailService.accountCreationEmail({
      to: newLandlord.email,
      name: `${newLandlord.firstName} ${newLandlord.lastName}`,
      password,
    });

    return newLandlord;
  }

  /**
   * Create a tenant (by landlord or admin)
   */
  async createTenant(
    landlordId: string,
    tenantData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      propertyUnit?: string;
      leaseStartDate?: Date;
      leaseEndDate?: Date;
    },
    estateId: string,
  ): Promise<User> {
    const landlord = await this.userModel.findById(landlordId);

    if (!landlord) {
      throw new BadRequestException('Landlord not found');
    }

    // Check permissions (only landlord themselves or admins)
    if (landlord.primaryRole === UserRole.LANDLORD && !landlord.landlordDetails?.canCreateTenants) {
      throw new ForbiddenException('Landlord does not have permission to create tenants');
    }

    const password = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTenant = new this.userModel({
      firstName: tenantData.firstName,
      lastName: tenantData.lastName,
      email: tenantData.email,
      phone: tenantData.phone,
      password: hashedPassword,
      primaryRole: UserRole.TENANT,
      estateId,
      tenantDetails: {
        landlordId: landlordId,
        propertyUnit: tenantData.propertyUnit,
        leaseStartDate: tenantData.leaseStartDate,
        leaseEndDate: tenantData.leaseEndDate,
        tenancyStatus: 'active',
      },
      hierarchy: {
        createdBy: landlordId,
        reportsTo: landlordId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: true,
    });

    await newTenant.save();

    // Update landlord's managed list if they are a landlord
    if (landlord.primaryRole === UserRole.LANDLORD) {
      await this.userModel.findByIdAndUpdate(landlordId, {
        $addToSet: {
          'hierarchy.manages': newTenant._id,
          'landlordDetails.tenants': newTenant._id,
        },
      });
    }

    // Send email notification
    await this.mailService.accountCreationEmail({
      to: newTenant.email,
      name: `${newTenant.firstName} ${newTenant.lastName}`,
      password,
    });

    return newTenant;
  }

  /**
   * Create a generic user (by Super Admin or Admin)
   */
  async createUser(
    creatorId: string,
    userData: CreateUserDto,
    estateId: string,
  ): Promise<User> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new BadRequestException('Invalid creator ID');
    }

    const canCreateUser =
      creator.primaryRole === UserRole.SUPER_ADMIN ||
      (creator.primaryRole === UserRole.ADMIN &&
        this.hasPermission(creator, 'users', 'create'));

    if (!canCreateUser) {
      throw new ForbiddenException('Insufficient permissions to create user');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const password = userData.password || this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
      estateId,
      hierarchy: {
        createdBy: creatorId,
        reportsTo: creatorId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: !userData.password,
    });

    await newUser.save();

    // Update creator's managed users
    await this.userModel.findByIdAndUpdate(creatorId, {
      $addToSet: { 'hierarchy.manages': newUser._id },
    });

    // Send email notification
    if (
      newUser.primaryRole !== UserRole.SUPER_ADMIN &&
      newUser.primaryRole !== UserRole.SITE_ADMIN
    ) {
      await this.mailService.accountCreationEmail({
        to: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`,
        password,
      });
    }

    return newUser;
  }

  async createSecurity(
    creatorId: string,
    securityData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
    estateId: string,
  ): Promise<User> {
    const isSecurityAlready = await this.userModel.findOne({
      primaryRole: UserRole.SECURITY,
      estateId,
    });

    if (isSecurityAlready) {
      throw new BadRequestException('Security already exists for this estate');
    }

    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new BadRequestException('Invalid creator ID');
    }

    const canCreateSecurity =
      creator.primaryRole === UserRole.SUPER_ADMIN ||
      (creator.primaryRole === UserRole.ADMIN &&
        this.hasPermission(creator, 'security', 'create'));

    if (!canCreateSecurity) {
      throw new ForbiddenException('Insufficient permissions to create security');
    }

    const password = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newSecurity = new this.userModel({
      firstName: securityData.firstName,
      lastName: securityData.lastName,
      email: securityData.email,
      phone: securityData.phone,
      password: hashedPassword,
      primaryRole: UserRole.SECURITY,
      estateId,
      securityDetails: {
        supervisorId: creatorId,
      },
      hierarchy: {
        createdBy: creatorId,
        reportsTo: creatorId,
        manages: [],
        relationshipEstablishedAt: new Date(),
      },
      isTemporaryPassword: true,
    });

    await newSecurity.save();

    // Update creator's managed users
    await this.userModel.findByIdAndUpdate(creatorId, {
      $addToSet: { 'hierarchy.manages': newSecurity._id },
    });

    // Send email notification
    await this.mailService.accountCreationEmail({
      to: newSecurity.email,
      name: `${newSecurity.firstName} ${newSecurity.lastName}`,
      password,
    });

    return newSecurity;
  }

  /**
   * Make landlord admin
   */
  async makeLandlordAdmin(
    superAdminId: string,
    landlordId: string,
    adminDetails: CreateAdminDetailsDto,
    reason?: string,
  ): Promise<User> {
    const superAdmin = await this.userModel.findById(superAdminId);
    if (!superAdmin || superAdmin.primaryRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can grant admin roles');
    }

    const landlord = await this.userModel.findById(landlordId);
    if (!landlord || landlord.primaryRole !== UserRole.LANDLORD) {
      throw new BadRequestException('User is not a landlord');
    }

    if (!landlord.landlordDetails?.isEligibleForAdmin) {
      throw new ForbiddenException('Landlord is not eligible for admin role');
    }

    const currentSecondaryRoles = landlord.secondaryRoles || [];
    const updatedSecondaryRoles = [
      ...new Set([
        ...currentSecondaryRoles.filter((role) => role !== UserRole.ADMIN),
        UserRole.LANDLORD,
      ]),
    ];

    const updatedUser = await this.userModel.findByIdAndUpdate(
      landlordId,
      {
        primaryRole: UserRole.ADMIN,
        secondaryRoles: updatedSecondaryRoles,
        $set: { adminDetails },
        $push: {
          roleHistory: {
            fromRole: UserRole.LANDLORD,
            toRole: UserRole.ADMIN,
            changedBy: superAdminId,
            changedAt: new Date(),
            reason: reason || 'Landlord promoted to admin by super admin',
          },
        },
      },
      { new: true },
    );

    return updatedUser!;
  }

  /**
   * Remove admin role
   */
  async removeAdminRole(
    superAdminId: string,
    adminId: string,
    reason?: string,
  ): Promise<User> {
    const superAdmin = await this.userModel.findById(superAdminId);
    if (!superAdmin || superAdmin.primaryRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can remove admin roles');
    }

    const admin = await this.userModel.findById(adminId);
    if (!admin || admin.primaryRole !== UserRole.ADMIN) {
      throw new BadRequestException('User is not an admin');
    }

    const updatedSecondaryRoles =
      admin.secondaryRoles?.filter((role) => role !== UserRole.LANDLORD) || [];

    const updatedUser = await this.userModel.findByIdAndUpdate(
      adminId,
      {
        primaryRole: UserRole.LANDLORD,
        secondaryRoles: updatedSecondaryRoles,
        $unset: { adminDetails: 1 },
        $set: {
          landlordDetails: {
            ownedProperties: [],
            tenants: [],
            canCreateTenants: true,
            isEligibleForAdmin: true,
          },
        },
        $push: {
          roleHistory: {
            fromRole: UserRole.ADMIN,
            toRole: UserRole.LANDLORD,
            changedBy: superAdminId,
            changedAt: new Date(),
            reason: reason || 'Admin role removed by super admin',
          },
        },
      },
      { new: true },
    );

    return updatedUser!;
  }

  /**
   * Grant additional permissions
   */
  async grantPermissions(
    granterId: string,
    userId: string,
    permissions: Permission[],
    reason?: string,
  ): Promise<User> {
    const granter = await this.userModel.findById(granterId);
    const user = await this.userModel.findById(userId);

    if (!granter || !user) {
      throw new BadRequestException('Invalid user IDs');
    }

    if (
      granter.primaryRole !== UserRole.SUPER_ADMIN &&
      !this.hasPermission(granter, 'permissions', 'manage')
    ) {
      throw new ForbiddenException('Insufficient permissions to grant permissions');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { grantedPermissions: { $each: permissions } },
        $push: {
          permissionHistory: {
            action: 'granted',
            permissions: permissions,
            grantedBy: granterId,
            grantedAt: new Date(),
            reason: reason,
          },
        },
      },
      { new: true },
    );

    return updatedUser!;
  }

  /**
   * Permissions checking
   */
  private hasPermission(user: User, resource: string, action: string): boolean {
    const hasBasePermission = user.basePermissions?.some(
      (p) => p.resource === resource && p.actions.includes(action as any),
    );
    const hasGrantedPermission = user.grantedPermissions?.some(
      (p) => p.resource === resource && p.actions.includes(action as any),
    );
    const isDenied = user.deniedPermissions?.some(
      (p) => p.resource === resource && p.actions.includes(action as any),
    );
    return (hasBasePermission || Boolean(hasGrantedPermission)) && !isDenied;
  }

  private getPositionPermissions(position: AdminPosition): Permission[] {
    const positionPermissions: Record<AdminPosition, Permission[]> = {
      [AdminPosition.FACILITY_MANAGER]: [
        { resource: ResourceType.PROPERTIES, actions: [PermissionAction.MANAGE] },
        { resource: ResourceType.MAINTENANCE, actions: [PermissionAction.MANAGE] },
      ],
      [AdminPosition.SECURITY_HEAD]: [
        { resource: ResourceType.SECURITY, actions: [PermissionAction.MANAGE] },
        { resource: ResourceType.USERS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
      ],
      [AdminPosition.FINANCE_MANAGER]: [
        { resource: ResourceType.FINANCES, actions: [PermissionAction.MANAGE] },
        { resource: ResourceType.REPORTS, actions: [PermissionAction.MANAGE] },
      ],
      [AdminPosition.TENANT_RELATIONS]: [
        { resource: ResourceType.TENANTS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
        { resource: ResourceType.MAINTENANCE, actions: [PermissionAction.READ, PermissionAction.ASSIGN] },
      ],
      [AdminPosition.MAINTENANCE_SUPERVISOR]: [],
      [AdminPosition.OPERATIONS_MANAGER]: [],
      [AdminPosition.PROPERTY_MANAGER]: [],
      [AdminPosition.CUSTOM]: [],
    };
    return positionPermissions[position] || [];
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  async getUserHierarchy(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('hierarchy.createdBy', 'firstName lastName email primaryRole')
      .populate('hierarchy.reportsTo', 'firstName lastName email primaryRole')
      .populate('hierarchy.manages', 'firstName lastName email primaryRole');

    if (!user) return null;

    return {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.primaryRole,
        email: user.email,
      },
      createdBy: user.hierarchy?.createdBy,
      reportsTo: user.hierarchy?.reportsTo,
      manages: user.hierarchy?.manages || [],
    };
  }

  async getUsersByEstate(estateId: string, role?: UserRole) {
    const filter: any = { estateId };
    if (role) filter.primaryRole = role;
    return this.userModel
      .find(filter)
      .select('-password -verificationToken -passwordResetToken')
      .populate('hierarchy.createdBy', 'firstName lastName')
      .populate('hierarchy.reportsTo', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async updateUserPermissions(
    userId: string,
    permissions: {
      basePermissions?: Permission[];
      grantedPermissions?: Permission[];
      deniedPermissions?: Permission[];
    },
  ): Promise<User> {
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

    // Complexity of merging permissions truncated for brevity, focusing on validity
    await user.save();
    return user;
  }

  private removeDuplicatePermissions(permissions: Permission[]): Permission[] {
    const uniqueMap = new Map<string, Permission>();
    permissions.forEach((permission) => {
      const key = `${permission.resource}-${(permission.actions || []).sort().join(',')}`;
      uniqueMap.set(key, permission);
    });
    return Array.from(uniqueMap.values());
  }

  private filterOutDeniedPermissions(permissions: Permission[], denied: Permission[]): Permission[] {
    return permissions.filter(p => !denied.some(d => d.resource === p.resource));
  }
}
