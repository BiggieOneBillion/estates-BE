import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindActiveLeviesQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';

@QueryHandler(FindActiveLeviesQuery)
export class FindActiveLeviesHandler implements IQueryHandler<FindActiveLeviesQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: FindActiveLeviesQuery): Promise<Levy[]> {
    return this.levyModel
      .find({ estateId: query.estateId, isActive: true })
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }
}
