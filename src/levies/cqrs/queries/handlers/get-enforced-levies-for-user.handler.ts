import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEnforcedLeviesForUserQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';

@QueryHandler(GetEnforcedLeviesForUserQuery)
export class GetEnforcedLeviesForUserHandler implements IQueryHandler<GetEnforcedLeviesForUserQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: GetEnforcedLeviesForUserQuery): Promise<Levy[]> {
    const { estateId, userRole } = query;
    return this.levyModel
      .find({
        estateId,
        isActive: true,
        applicableRoles: userRole,
        enforcesTokenRestriction: true,
      })
      .exec();
  }
}
