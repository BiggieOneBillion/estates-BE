import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLevyCommand } from '../impl/levy-commands.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';

@CommandHandler(UpdateLevyCommand)
export class UpdateLevyHandler implements ICommandHandler<UpdateLevyCommand> {
  private readonly logger = new Logger(UpdateLevyHandler.name);

  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(command: UpdateLevyCommand): Promise<Levy> {
    const { id, updateLevyDto, estateId } = command;

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
}
