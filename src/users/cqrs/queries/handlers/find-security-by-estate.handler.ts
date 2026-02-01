import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindSecurityByEstateQuery } from '../impl/find-security-by-estate.query';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../../../entities/user.entity';
import { Model } from 'mongoose';

@QueryHandler(FindSecurityByEstateQuery)
export class FindSecurityByEstateHandler implements IQueryHandler<FindSecurityByEstateQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(query: FindSecurityByEstateQuery): Promise<User | null> {
    return this.userModel
      .findOne({ primaryRole: UserRole.SECURITY, estateId: query.estateId })
      .exec();
  }
}
