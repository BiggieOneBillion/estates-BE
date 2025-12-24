// src/estates/estates.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { Estate } from './entities/estate.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EstatesService {
  constructor(
    @InjectModel(Estate.name) private readonly estateModel: Model<Estate>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(
    createEstateDto: CreateEstateDto,
    userId: string,
  ): Promise<Estate> {
    // console.log("Estate details---", createEstateDto)
    const existingEstate = await this.estateModel.findOne({
      name: createEstateDto.name,
    });

    // console.log("Existing estate---", existingEstate)

    if (existingEstate) {
      throw new ConflictException('Estate name already exists');
    }

    // console.log("GO ON BRO", userId)

    const user = await this.userModel.findById({ _id: userId });

    // console.log("THE OWNER ID---", user)

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.isEmailVerified) {
      throw new ConflictException(
        'User email not verified yet. Cannot create estate',
      );
    }

    if (user.estateId) {
      throw new ConflictException('User already has an estate');
    }

    const newEstate = new this.estateModel({
      ...createEstateDto,
      owner: userId,
    });

    await newEstate.save();

    user.estateId = newEstate._id as unknown as ObjectId;

    await user.save();

    return newEstate;
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
