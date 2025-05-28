// src/estates/estates.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { Estate } from './entities/estate.entity';

@Injectable()
export class EstatesService {
  constructor(
    @InjectModel(Estate.name) private readonly estateModel: Model<Estate>,
  ) {}

  async create(createEstateDto: CreateEstateDto): Promise<Estate> {
    const existingEstate = await this.estateModel.findOne({ name: createEstateDto.name });
    if (existingEstate) {
      throw new ConflictException('Estate name already exists');
    }

    const newEstate = new this.estateModel(createEstateDto);
    return newEstate.save();
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

    const updatedEstate = await this.estateModel.findByIdAndUpdate(id, updateEstateDto, { new: true }).exec()

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
