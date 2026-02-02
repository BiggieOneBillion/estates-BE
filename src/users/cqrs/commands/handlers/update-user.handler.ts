import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../impl/update-user.command';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<User>,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { userId, updateData } = command;
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updateObj: any = { ...updateData };

    if (updateObj.password) {
      updateObj.password = await bcrypt.hash(updateObj.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateObj, { new: true })
      .exec();

    if (!updatedUser) {
      throw new BadRequestException(`Could not update user`);
    }

    return updatedUser;
  }
}
