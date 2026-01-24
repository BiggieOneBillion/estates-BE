// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import {
  AdminPosition,
  Permission,
  User,
  UserRole,
} from './entities/user.entity';
import { MailService } from 'src/common/services/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto, creator: string): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser =
      createUserDto.primaryRole === UserRole.ADMIN
        ? new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            adminDetails: {
              ...createUserDto.adminDetails,
              positionPermissions: this.getPositionPermissions(
                createUserDto.adminDetails?.position!,
              ),
              appointedAt: new Date(),
              appointedBy: creator,
              hierarchy: {
                createdBy: creator,
                reportsTo: creator,
                manages: [],
                relationshipEstablishedAt: new Date(),
              },
              isTemporaryPassword: true,
            },
          })
        : new this.userModel({
            ...createUserDto,
            password: hashedPassword,
          });

    if (
      createUserDto.primaryRole !== UserRole.SUPER_ADMIN &&
      createUserDto.primaryRole !== UserRole.SITE_ADMIN
    ) {
      await this.mailService.accountCreationEmail({
        to: createUserDto.email,
        name: createUserDto.firstName,
        password: createUserDto.password!,
      });
    }

    return newUser.save();
  }

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
      [AdminPosition.MAINTENANCE_SUPERVISOR]: [
        { resource: 'properties' as any, actions: ['manage' as any] },
        { resource: 'maintenance' as any, actions: ['manage' as any] },
      ],
      [AdminPosition.OPERATIONS_MANAGER]: [
        { resource: 'operations' as any, actions: ['manage' as any] },
        { resource: 'maintenance' as any, actions: ['manage' as any] },
      ],
      [AdminPosition.PROPERTY_MANAGER]: [
        { resource: 'properties' as any, actions: ['manage' as any] },
        { resource: 'maintenance' as any, actions: ['manage' as any] },
      ],
      [AdminPosition.CUSTOM]: [],
    };

    return positionPermissions[position] || [];
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userModel.find({ primaryRole: role }).exec();
  }

  async findByAdminPosition(position: AdminPosition): Promise<User[]> {
    return this.userModel.find({ 'adminDetails.position': position }).exec();
  }

  async findByEstate(estateId: string): Promise<User[]> {
    return this.userModel.find({ estateId });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findSecurity(estateId: string): Promise<User | null> {
    return this.userModel
      .findOne({ primaryRole: UserRole.SECURITY, estateId })
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new BadRequestException(`Could not update user`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async disableTokenGeneration(userId: string) {
    // Update the user's canCreateToken property to false
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { canCreateToken: false },
      { new: true },
    );

    return {
      message: `Token generation disabled for ${updatedUser?.firstName} ${updatedUser?.lastName}`,
      user: updatedUser,
    };
  }

  async enableTokenGeneration(userId: string) {
    // Update the user's canCreateToken property to true
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { canCreateToken: true },
      { new: true },
    );

    return {
      message: `Token generation enabled for ${updatedUser?.firstName} ${updatedUser?.lastName}`,
      user: updatedUser,
    };
  }

  async registerFcmToken(userId: string, fcmToken: string): Promise<User> {
    const user = await this.findOne(userId);
    
    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    // Add token if it doesn't already exist
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    return user;
  }

  async removeFcmToken(userId: string, fcmToken: string): Promise<User> {
    const user = await this.findOne(userId);
    
    if (user.fcmTokens) {
      user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken);
      await user.save();
    }

    return user;
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: { email?: boolean; push?: boolean; sms?: boolean },
  ): Promise<User> {
    const user = await this.findOne(userId);
    
    const currentPrefs = user.notificationPreferences || { email: true, push: true, sms: false };
    user.notificationPreferences = {
      email: preferences.email !== undefined ? preferences.email : currentPrefs.email,
      push: preferences.push !== undefined ? preferences.push : currentPrefs.push,
      sms: preferences.sms !== undefined ? preferences.sms : currentPrefs.sms,
    };

    await user.save();
    return user;
  }

  async findByEstateAndRoles(estateId: string, roles: string[]): Promise<User[]> {
    return this.userModel
      .find({
        estateId,
        primaryRole: { $in: roles },
      })
      .exec();
  }
}
