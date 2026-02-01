import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, ObjectId } from 'mongoose';

import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { Estate } from './entities/estate.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EstatesService {
  private readonly logger = new Logger(EstatesService.name);

  constructor(
    @InjectModel(Estate.name) private readonly estateModel: Model<Estate>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(
    createEstateDto: CreateEstateDto,
    userId: string,
  ): Promise<Estate> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const existingEstate = await this.estateModel
        .findOne({ name: createEstateDto.name })
        .session(session);

      if (existingEstate) {
        throw new ConflictException('Estate name already exists');
      }

      const user = await this.userModel.findById(userId).session(session);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.isEmailVerified) {
        throw new ConflictException('User email not verified yet. Cannot create estate');
      }

      if (user.estateId) {
        throw new ConflictException('User already has an estate');
      }

      const newEstate = new this.estateModel({
        ...createEstateDto,
        owner: userId,
      });

      await newEstate.save({ session });

      user.estateId = newEstate._id as unknown as ObjectId;
      await user.save({ session });

      await session.commitTransaction();
      this.logger.log(`Estate "${newEstate.name}" created successfully for user ${userId}`);
      return newEstate;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Failed to create estate: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Estate[]> {
    return this.estateModel.find().exec();
  }

  async findOne(id: string): Promise<Estate> {
    const estate = await this.estateModel.findById(id).exec();
    if (!estate) {
      throw new NotFoundException(`Estate with ID ${id} not found`);
    }
    return estate;
  }

  async update(id: string, updateEstateDto: UpdateEstateDto): Promise<Estate> {
    const estate = await this.estateModel.findById(id);
    if (!estate) {
      throw new NotFoundException(`Estate with ID ${id} not found`);
    }

    const updatedEstate = await this.estateModel
      .findByIdAndUpdate(id, updateEstateDto, { new: true })
      .exec();

    if (!updatedEstate) {
      throw new NotFoundException(`Estate with ID ${id} not found`);
    }
    return updatedEstate;
  }

  async remove(id: string): Promise<void> {
    const result = await this.estateModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Estate with ID ${id} not found`);
    }
  }
}
