import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllLeviesQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';

@QueryHandler(FindAllLeviesQuery)
export class FindAllLeviesHandler implements IQueryHandler<FindAllLeviesQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: FindAllLeviesQuery): Promise<Levy[]> {
    return this.levyModel
      .find({ estateId: query.estateId })
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }
}
