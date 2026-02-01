import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteEstateCommand } from '../impl/delete-estate.command';
import { InjectModel } from '@nestjs/mongoose';
import { Estate } from '../../../entities/estate.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteEstateCommand)
export class DeleteEstateHandler implements ICommandHandler<DeleteEstateCommand> {
  constructor(
    @InjectModel(Estate.name) private readonly estateModel: SoftDeleteModel<Estate>,
  ) {}

  async execute(command: DeleteEstateCommand): Promise<void> {
    const result = await this.estateModel.softDelete({ _id: command.id });
    if (result.matchedCount === 0) {
      throw new NotFoundException(`Estate with ID ${command.id} not found`);
    }
  }
}
