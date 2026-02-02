import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DisableTokenGenerationCommand } from '../impl/disable-token-generation.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { Model } from 'mongoose';

@CommandHandler(DisableTokenGenerationCommand)
export class DisableTokenGenerationHandler implements ICommandHandler<DisableTokenGenerationCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: DisableTokenGenerationCommand): Promise<any> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      command.userId,
      { canCreateToken: false },
      { new: true },
    );

    return {
      message: `Token generation disabled for ${updatedUser?.firstName} ${updatedUser?.lastName}`,
      user: updatedUser,
    };
  }
}
