import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePropertyCommand } from '../impl/update-property.command';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from '../../../entities/property.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdatePropertyCommand)
export class UpdatePropertyHandler implements ICommandHandler<UpdatePropertyCommand> {
  constructor(
    @InjectModel(Property.name) private readonly propertyModel: SoftDeleteModel<Property>,
  ) {}

  async execute(command: UpdatePropertyCommand): Promise<Property> {
    const { id, updatePropertyDto } = command;
    const property = await this.propertyModel.findById(id);
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const updatedProperty = await this.propertyModel
      .findByIdAndUpdate(id, updatePropertyDto, { new: true })
      .exec();

    if (!updatedProperty) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return updatedProperty;
  }
}
