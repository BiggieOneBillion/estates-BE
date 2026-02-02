import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePropertyCommand } from '../impl/delete-property.command';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from '../../../entities/property.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeletePropertyCommand)
export class DeletePropertyHandler implements ICommandHandler<DeletePropertyCommand> {
  constructor(
    @InjectModel(Property.name) private readonly propertyModel: SoftDeleteModel<Property>,
  ) {}

  async execute(command: DeletePropertyCommand): Promise<void> {
    const result = await this.propertyModel.softDelete({ _id: command.id });
    if (result.matchedCount === 0) {
      throw new NotFoundException(`Property with ID ${command.id} not found`);
    }
  }
}
