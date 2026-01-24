import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Levy, LevyType } from './entities/levy.entity';
import { CreateLevyDto } from './dto/create-levy.dto';
import { UpdateLevyDto } from './dto/update-levy.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class LeviesService {
  private readonly logger = new Logger(LeviesService.name);

  constructor(
    @InjectModel(Levy.name) private readonly levyModel: Model<Levy>,
  ) {}

  async create(createLevyDto: CreateLevyDto, creatorId: string, estateId: string): Promise<Levy> {
    // Validate due date is in the future
    if (new Date(createLevyDto.dueDate) <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    const newLevy = new this.levyModel({
      ...createLevyDto,
      estateId,
      createdBy: creatorId,
    });

    const savedLevy = await newLevy.save();
    this.logger.log(`Levy created: ${savedLevy.title} for estate ${estateId}`);
    
    return savedLevy;
  }

  async findAll(estateId: string): Promise<Levy[]> {
    return this.levyModel.find({ estateId }).populate('createdBy', 'firstName lastName email').exec();
  }

  async findActive(estateId: string): Promise<Levy[]> {
    return this.levyModel
      .find({ estateId, isActive: true })
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }

  async findOne(id: string, estateId: string): Promise<Levy> {
    const levy = await this.levyModel
      .findOne({ _id: id, estateId })
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!levy) {
      throw new NotFoundException(`Levy with ID ${id} not found`);
    }

    return levy;
  }

  async update(id: string, updateLevyDto: UpdateLevyDto, estateId: string): Promise<Levy> {
    // Validate due date if being updated
    if (updateLevyDto.dueDate && new Date(updateLevyDto.dueDate) <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    const updatedLevy = await this.levyModel
      .findOneAndUpdate({ _id: id, estateId }, updateLevyDto, { new: true })
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!updatedLevy) {
      throw new NotFoundException(`Levy with ID ${id} not found`);
    }

    this.logger.log(`Levy updated: ${updatedLevy.title}`);
    return updatedLevy;
  }

  async remove(id: string, estateId: string): Promise<void> {
    const result = await this.levyModel.deleteOne({ _id: id, estateId }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Levy with ID ${id} not found`);
    }

    this.logger.log(`Levy deleted: ${id}`);
  }

  async getActiveLeviesForUser(userId: string, userRole: UserRole, estateId: string): Promise<Levy[]> {
    const now = new Date();
    
    return this.levyModel
      .find({
        estateId,
        isActive: true,
        applicableRoles: userRole,
        dueDate: { $gte: now },
      })
      .exec();
  }

  async getEnforcedLeviesForUser(userId: string, userRole: UserRole, estateId: string): Promise<Levy[]> {
    return this.levyModel
      .find({
        estateId,
        isActive: true,
        applicableRoles: userRole,
        enforcesTokenRestriction: true,
      })
      .exec();
  }

  async getDefaulters(levyId: string, estateId: string): Promise<any> {
    // This will be implemented after PaymentsService is created
    // It will return users who haven't paid this levy
    throw new Error('Method not implemented yet');
  }
}
