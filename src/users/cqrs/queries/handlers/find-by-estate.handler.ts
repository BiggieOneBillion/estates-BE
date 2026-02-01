import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindByEstateQuery } from '../impl/find-by-estate.query';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../entities/user.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../../dto/response/user.response.dto';

@QueryHandler(FindByEstateQuery)
export class FindByEstateHandler implements IQueryHandler<FindByEstateQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<User>,
  ) {}

  async execute(query: FindByEstateQuery): Promise<UserResponseDto[]> {
    const users = await this.userModel.find({ estateId: query.estateId }).exec();
    
    return users.map((user) => 
      plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      })
    );
  }
}
