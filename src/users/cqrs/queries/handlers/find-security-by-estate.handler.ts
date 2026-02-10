import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindSecurityByEstateQuery } from '../impl/find-security-by-estate.query';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../../dto/response/user.response.dto';

@QueryHandler(FindSecurityByEstateQuery)
export class FindSecurityByEstateHandler implements IQueryHandler<FindSecurityByEstateQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(query: FindSecurityByEstateQuery): Promise<UserResponseDto | null> {
    const user = await this.userModel
      .findOne({ primaryRole: UserRole.SECURITY, estateId: query.estateId })
      .exec();
    
    if (!user) {
      return null;
    }
    
    return plainToInstance(UserResponseDto, user.toObject(), { excludeExtraneousValues: true });
  }
}
