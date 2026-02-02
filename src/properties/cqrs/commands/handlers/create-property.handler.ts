import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePropertyCommand } from '../impl/create-property.command';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from '../../../entities/property.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';

@CommandHandler(CreatePropertyCommand)
export class CreatePropertyHandler implements ICommandHandler<CreatePropertyCommand> {
  constructor(
    @InjectModel(Property.name) private readonly propertyModel: SoftDeleteModel<Property>,
  ) {}

  async execute(command: CreatePropertyCommand): Promise<Property> {
    const newProperty = new this.propertyModel(command.createPropertyDto);
    return newProperty.save();
  }
}
