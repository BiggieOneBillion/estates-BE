import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindByEmailQuery } from '../impl/find-by-email.query';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../../dto/response/user.response.dto';

@QueryHandler(FindByEmailQuery)
export class FindByEmailHandler implements IQueryHandler<FindByEmailQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<User>,
  ) {}

  async execute(query: FindByEmailQuery): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne({ email: query.email }).exec();
    if (!user) {
      return null;
    }
    return plainToInstance(UserResponseDto, user.toObject(), { excludeExtraneousValues: true });
  }
}
