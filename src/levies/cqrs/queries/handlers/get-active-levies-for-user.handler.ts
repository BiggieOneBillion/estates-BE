import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActiveLeviesForUserQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';

@QueryHandler(GetActiveLeviesForUserQuery)
export class GetActiveLeviesForUserHandler implements IQueryHandler<GetActiveLeviesForUserQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: GetActiveLeviesForUserQuery): Promise<Levy[]> {
    const { estateId, userRole } = query;
    const now = new Date();
    
    return this.levyModel
      .find({
        estateId,
        isActive: true,
        applicableRoles: userRole,
        dueDate: { $gte: now },
      })
      .exec();
  }
}
