import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllEstatesQuery } from '../impl/find-all-estates.query';
import { InjectModel } from '@nestjs/mongoose';
import { Estate } from '../../../entities/estate.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';

@QueryHandler(FindAllEstatesQuery)
export class FindAllEstatesHandler implements IQueryHandler<FindAllEstatesQuery> {
  constructor(
    @InjectModel(Estate.name) private readonly estateModel: SoftDeleteModel<Estate>,
  ) {}

  async execute(query: FindAllEstatesQuery): Promise<Estate[]> {
    return this.estateModel.find().exec();
  }
}
