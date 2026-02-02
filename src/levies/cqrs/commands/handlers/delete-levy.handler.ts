import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteLevyCommand } from '../impl/levy-commands.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';
import { NotFoundException, Logger } from '@nestjs/common';

@CommandHandler(DeleteLevyCommand)
export class DeleteLevyHandler implements ICommandHandler<DeleteLevyCommand> {
  private readonly logger = new Logger(DeleteLevyHandler.name);

  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(command: DeleteLevyCommand): Promise<void> {
    const { id, estateId } = command;
    const result = await this.levyModel.softDelete({ _id: id, estateId });
    
    if (result.matchedCount === 0) {
      throw new NotFoundException(`Levy with ID ${id} not found`);
    }

    this.logger.log(`Levy deleted: ${id}`);
  }
}
