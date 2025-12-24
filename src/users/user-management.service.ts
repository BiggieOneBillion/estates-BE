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
} from './entities/user.entity';
import { MailService } from 'src/common/services/mail.service';
import { CreateAdminDetailsDto } from './dto/create-user.dto';
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
      newAdmin = new this.userModel({
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        phone: adminData.phone,
        password: this.generateTemporaryPassword(),
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
   * Create a tenant (by landlord)
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

    if (!landlord || landlord.primaryRole !== UserRole.LANDLORD) {
      throw new ForbiddenException('Only landlords can create tenants');
    }

    if (!landlord.landlordDetails?.canCreateTenants) {
      throw new ForbiddenException(
        'Landlord does not have permission to create tenants',
      );
    }

    const newTenant = new this.userModel({
      firstName: tenantData.firstName,
      lastName: tenantData.lastName,
      email: tenantData.email,
      phone: tenantData.phone,
      password: this.generateTemporaryPassword(),
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

    // Update landlord's tenant list
    await this.userModel.findByIdAndUpdate(landlordId, {
      $addToSet: {
        'hierarchy.manages': newTenant._id,
        'landlordDetails.tenants': newTenant._id,
      },
    });

    return newTenant;
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

    const isSecurityAlready = await this.userModel.findOne({ //! in the current implementation the estate can only have one estate security personnel to check in visitors.
      primaryRole: UserRole.SECURITY,
    });

    if (isSecurityAlready) {
       throw new BadRequestException("Security already exists")
    }

    const creator = await this.userModel.findById(creatorId);

    // Check if creator has permission
    if (!creator) {
      throw new BadRequestException('Invalid creator ID');
    }

    const canCreateLandlord =
      creator.primaryRole === UserRole.SUPER_ADMIN ||
      (creator.primaryRole === UserRole.ADMIN &&
        this.hasPermission(creator, 'security', 'create'));

    if (!canCreateLandlord) {
      throw new ForbiddenException(
        'Insufficient permissions to create landlord',
      );
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
   * Make landlord admin (demote to landlord)
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

    // Get current secondary roles and add LANDLORD, but remove ADMIN if it exists
    const currentSecondaryRoles = landlord.secondaryRoles || [];
    const updatedSecondaryRoles = [
      ...new Set([
        ...currentSecondaryRoles.filter((role) => role !== UserRole.ADMIN),
        UserRole.LANDLORD,
      ]),
    ];

    // Update user to admin role while keeping landlord as secondary role
    const updatedUser = await this.userModel.findByIdAndUpdate(
      landlordId,
      {
        primaryRole: UserRole.ADMIN,
        secondaryRoles: updatedSecondaryRoles,
        $set: { adminDetails },
        // $set: {
        //   adminDetails: {
        //     department: 'General Administration',
        //     responsibilities: ['Property Management', 'User Management'],
        //     assignedEstates: [],
        //   },
        // },
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
   * Remove admin role (demote to landlord)
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

    // Filter out UserRole.LANDLORD from secondaryRoles
    const updatedSecondaryRoles =
      admin.secondaryRoles?.filter((role) => role !== UserRole.LANDLORD) || [];

    // Update user to landlord role
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
   * Grant additional permissions to a user
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

    // Check if granter has permission to grant permissions
    if (
      granter.primaryRole !== UserRole.SUPER_ADMIN &&
      !this.hasPermission(granter, 'permissions', 'manage')
    ) {
      throw new ForbiddenException(
        'Insufficient permissions to grant permissions',
      );
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
   * Check if a user has a specific permission
   */
  private hasPermission(user: User, resource: string, action: string): boolean {
    // Check base permissions
    const hasBasePermission = user.basePermissions?.some(
      (p) => p.resource === resource && p.actions.includes(action as any),
    );

    // Check granted permissions
    const hasGrantedPermission = user.grantedPermissions?.some(
      (p) => p.resource === resource && p.actions.includes(action as any),
    );

    // Check denied permissions
    const isDenied = user.deniedPermissions?.some(
      (p) => p.resource === resource && p.actions.includes(action as any),
    );

    return (hasBasePermission || Boolean(hasGrantedPermission)) && !isDenied;
  }

  /**
   * Get default permissions for admin positions
   */
  private getPositionPermissions(position: AdminPosition): Permission[] {
    const positionPermissions: Record<AdminPosition, Permission[]> = {
      [AdminPosition.FACILITY_MANAGER]: [
        { resource: 'properties' as any, actions: ['manage' as any] },
        { resource: 'maintenance' as any, actions: ['manage' as any] },
      ],
      [AdminPosition.SECURITY_HEAD]: [
        { resource: 'security' as any, actions: ['manage' as any] },
        { resource: 'users' as any, actions: ['read' as any, 'update' as any] },
      ],
      [AdminPosition.FINANCE_MANAGER]: [
        { resource: 'finances' as any, actions: ['manage' as any] },
        { resource: 'reports' as any, actions: ['manage' as any] },
      ],
      [AdminPosition.TENANT_RELATIONS]: [
        {
          resource: 'tenants' as any,
          actions: ['read' as any, 'update' as any],
        },
        {
          resource: 'maintenance' as any,
          actions: ['read' as any, 'assign' as any],
        },
      ],
      // Add more position-specific permissions
      [AdminPosition.MAINTENANCE_SUPERVISOR]: [],
      [AdminPosition.OPERATIONS_MANAGER]: [],
      [AdminPosition.PROPERTY_MANAGER]: [],
      [AdminPosition.CUSTOM]: [],
    };

    return positionPermissions[position] || [];
  }

  /**
   * Generate temporary password
   */
  private generateTemporaryPassword(): string {
    // In real implementation, use bcrypt to hash this
    return Math.random().toString(36).slice(-8);
  }

  /**
   * Get user hierarchy
   */
  async getUserHierarchy(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('hierarchy.createdBy', 'firstName lastName email primaryRole')
      .populate('hierarchy.reportsTo', 'firstName lastName email primaryRole')
      .populate('hierarchy.manages', 'firstName lastName email primaryRole');

    return {
      user: {
        id: user!._id,
        name: `${user!.firstName} ${user!.lastName}`,
        role: user!.primaryRole,
        email: user!.email,
      },
      createdBy: user!.hierarchy?.createdBy,
      reportsTo: user!.hierarchy?.reportsTo,
      manages: user!.hierarchy?.manages || [],
    };
  }

  /**
   * Get all users by estate with role filtering
   */
  async getUsersByEstate(estateId: string, role?: UserRole) {
    const filter: any = { estateId };
    if (role) {
      filter.primaryRole = role;
    }

    return this.userModel
      .find(filter)
      .select('-password -verificationToken -passwordResetToken')
      .populate('hierarchy.createdBy', 'firstName lastName')
      .populate('hierarchy.reportsTo', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  /**
   * Update user permissions by merging with existing permissions
   */
  // async updateUserPermissions(
  //   userId: string,
  //   permissions: {
  //     basePermissions?: Permission[];
  //     grantedPermissions?: Permission[];
  //     deniedPermissions?: Permission[];
  //   },
  // ): Promise<User> {
  //   const user = await this.userModel.findById(userId);
  //   if (!user) {
  //     throw new BadRequestException('User not found');
  //   }

  //   const updates: any = {};
  //   const deniedPermissions = [
  //     ...(user.deniedPermissions || []),
  //     ...(permissions.deniedPermissions || []),
  //   ];

  //   // Handle basePermissions
  //   if (permissions.basePermissions) {
  //     const existingBase = user.basePermissions || [];
  //     const mergedBase = [...existingBase, ...permissions.basePermissions];
  //     const uniqueBase = this.removeDuplicatePermissions(mergedBase);
  //     // Remove any denied permissions from base permissions
  //     updates.basePermissions = this.filterOutDeniedPermissions(
  //       uniqueBase,
  //       deniedPermissions,
  //     );
  //   }

  //   // Handle grantedPermissions
  //   if (permissions.grantedPermissions) {
  //     const existingGranted = user.grantedPermissions || [];
  //     const mergedGranted = [
  //       ...existingGranted,
  //       ...permissions.grantedPermissions,
  //     ];
  //     const uniqueGranted = this.removeDuplicatePermissions(mergedGranted);
  //     // Remove any denied permissions from granted permissions
  //     updates.grantedPermissions = this.filterOutDeniedPermissions(
  //       uniqueGranted,
  //       deniedPermissions,
  //     );
  //   }

  //   // Handle deniedPermissions
  //   if (permissions.deniedPermissions) {
  //     const uniqueDenied = this.removeDuplicatePermissions(deniedPermissions);
  //     updates.deniedPermissions = uniqueDenied;

  //     // If there are existing permissions, filter out the newly denied ones
  //     if (!permissions.basePermissions && user.basePermissions) {
  //       updates.basePermissions = this.filterOutDeniedPermissions(
  //         user.basePermissions,
  //         uniqueDenied,
  //       );
  //     }
  //     if (!permissions.grantedPermissions && user.grantedPermissions) {
  //       updates.grantedPermissions = this.filterOutDeniedPermissions(
  //         user.grantedPermissions,
  //         uniqueDenied,
  //       );
  //     }
  //   }

  //   console.log("------------------MERGED UPDATE--------------------", updates)

  //   // Update the user with merged permissions
  //   const updatedUser = await this.userModel.findByIdAndUpdate(
  //     userId,
  //     { $set: updates },
  //     { new: true },
  //   );

  //   return updatedUser!;
  // }

  async updateUserPermissions(
    userId: string,
    permissions: {
      basePermissions?: Permission[];
      grantedPermissions?: Permission[];
      deniedPermissions?: Permission[];
    },
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    let deniedPermissions = [
      ...(user.deniedPermissions || []),
      ...(permissions.deniedPermissions || []),
    ];

    // Handle basePermissions
    if (permissions.basePermissions) {
      const existingBase = user.basePermissions || [];
      const mergedBase = [...existingBase, ...permissions.basePermissions];
      const uniqueBase = this.removeDuplicatePermissions(mergedBase);
      user.basePermissions = this.filterOutDeniedPermissions(
        uniqueBase,
        deniedPermissions,
      );
    }

    // Handle grantedPermissions
    if (permissions.grantedPermissions) {
      const existingGranted = user.grantedPermissions || [];
      const mergedGranted = [
        ...existingGranted,
        ...permissions.grantedPermissions,
      ];
      const unique = mergedGranted.reduce<Permission[]>((acc, current) => {
        const existing = acc.find((item) => item.resource === current.resource);
        if (existing) {
          // Create a Set to ensure unique actions
          const uniqueActions = new Set([
            ...existing.actions,
            ...current.actions,
          ]);
          existing.actions = Array.from(uniqueActions);

          if (current.conditions) {
            const uniqueConditions = new Set([
              ...(existing.conditions || []),
              ...current.conditions,
            ]);
            existing.conditions = Array.from(uniqueConditions);
          }
          return acc;
        }
        acc.push(current);
        return acc;
      }, [] as Permission[]);
      user.grantedPermissions = unique;
    }

    if (permissions.grantedPermissions) {
      deniedPermissions = deniedPermissions
        .map((denied) => {
          const matchingGranted = permissions.grantedPermissions!.find(
            (granted) => granted.resource === denied.resource,
          );

          if (matchingGranted) {
            // Remove any actions from denied that are in granted
            const remainingDeniedActions = denied.actions.filter(
              (action) => !matchingGranted.actions.includes(action),
            );

            if (remainingDeniedActions.length === 0) {
              // If no actions remain, this permission should be filtered out
              return null;
            }

            return {
              ...denied,
              actions: remainingDeniedActions,
            };
          }

          return denied;
        })
        .filter((permission): permission is Permission => permission !== null);

      user.deniedPermissions =
        this.removeDuplicatePermissions(deniedPermissions);
    }

    // Handle deniedPermissions
    if (permissions.deniedPermissions) {
      const unique = deniedPermissions.reduce<Permission[]>((acc, current) => {
        const existing = acc.find((item) => item.resource === current.resource);
        if (existing) {
          // Create a Set to ensure unique actions
          const uniqueActions = new Set([
            ...existing.actions,
            ...current.actions,
          ]);
          existing.actions = Array.from(uniqueActions);

          if (current.conditions) {
            const uniqueConditions = new Set([
              ...(existing.conditions || []),
              ...current.conditions,
            ]);
            existing.conditions = Array.from(uniqueConditions);
          }
          return acc;
        }
        acc.push(current);
        return acc;
      }, [] as Permission[]);

      user.deniedPermissions = unique;

      // If there are existing permissions, filter out the newly denied ones
      if (!permissions.basePermissions && user.basePermissions) {
        user.basePermissions = this.filterOutDeniedPermissions(
          user.basePermissions,
          user.deniedPermissions,
        );
      }
      if (!permissions.grantedPermissions && user.grantedPermissions) {
        user.grantedPermissions = this.filterOutDeniedPermissions(
          user.grantedPermissions,
          user.deniedPermissions,
        );
      }
    }

    // Save the updated user
    await user.save();
    return user;
  }

  /**
   * Helper function to remove duplicate permissions
   */
  private removeDuplicatePermissions(permissions: Permission[]): Permission[] {
    const uniqueMap = new Map<string, Permission>();

    permissions.forEach((permission) => {
      const key = `${permission.resource}-${permission.actions.sort().join(',')}-${(permission.conditions || []).sort().join(',')}`;
      uniqueMap.set(key, permission);
    });

    return Array.from(uniqueMap.values());
  }

  /**
   * Helper function to filter out denied permissions
   */
  private arraysHaveOverlap<T>(arr1: T[], arr2: T[]): boolean {
    return arr1.some((item) => arr2.includes(item));
  }

  private subtractArrays<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((item) => !arr2.includes(item));
  }

  private filterOutDeniedPermissions(
    permissions: Permission[],
    deniedPermissions: Permission[],
  ): Permission[] {
    return permissions
      .map((permission) => {
        // Find all denied permissions for the same resource
        const matchingDenied = deniedPermissions.filter(
          (denied) => denied.resource === permission.resource,
        );

        let allowedActions = [...permission.actions];

        for (const denied of matchingDenied) {
          // Only subtract if conditions overlap or are not specified
          const conditionsOverlap =
            !denied.conditions?.length ||
            !permission.conditions?.length ||
            this.arraysHaveOverlap(denied.conditions, permission.conditions);

          if (conditionsOverlap) {
            allowedActions = this.subtractArrays(
              allowedActions,
              denied.actions,
            );
          }
        }

        // Return updated permission only if there are remaining allowed actions
        return allowedActions.length
          ? { ...permission, actions: allowedActions }
          : null;
      })
      .filter(Boolean) as Permission[];
  }
}
