import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTokenCommand } from '../impl/delete-token.command';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token } from '../../../entities/token.entity';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteTokenCommand)
export class DeleteTokenHandler implements ICommandHandler<DeleteTokenCommand> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(command: DeleteTokenCommand): Promise<void> {
    const result = await this.tokenModel.softDelete({ _id: command.id });
    if (result.matchedCount === 0) {
      throw new NotFoundException(`Token with ID ${command.id} not found`);
    }
  }
}
