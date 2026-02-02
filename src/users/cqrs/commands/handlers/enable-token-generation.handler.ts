import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnableTokenGenerationCommand } from '../impl/enable-token-generation.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { Model } from 'mongoose';

@CommandHandler(EnableTokenGenerationCommand)
export class EnableTokenGenerationHandler implements ICommandHandler<EnableTokenGenerationCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: EnableTokenGenerationCommand): Promise<any> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      command.userId,
      { canCreateToken: true },
      { new: true },
    );

    return {
      message: `Token generation enabled for ${updatedUser?.firstName} ${updatedUser?.lastName}`,
      user: updatedUser,
    };
  }
}
