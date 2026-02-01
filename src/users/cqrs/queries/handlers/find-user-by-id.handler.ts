import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserByIdQuery } from '../impl/find-user-by-id.query';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<User>,
  ) {}

  async execute(query: FindUserByIdQuery): Promise<User> {
    const user = await this.userModel.findById(query.userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }
    return user;
  }
}
