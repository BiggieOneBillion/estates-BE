import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEstateCommand } from '../impl/update-estate.command';
import { InjectModel } from '@nestjs/mongoose';
import { Estate } from '../../../entities/estate.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateEstateCommand)
export class UpdateEstateHandler implements ICommandHandler<UpdateEstateCommand> {
  constructor(
    @InjectModel(Estate.name) private readonly estateModel: SoftDeleteModel<Estate>,
  ) {}

  async execute(command: UpdateEstateCommand): Promise<Estate> {
    const { id, updateEstateDto } = command;
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
}
