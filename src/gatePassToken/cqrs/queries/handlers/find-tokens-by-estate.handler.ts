import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTokensByEstateQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token } from '../../../entities/token.entity';

@QueryHandler(FindTokensByEstateQuery)
export class FindTokensByEstateHandler implements IQueryHandler<FindTokensByEstateQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindTokensByEstateQuery): Promise<Token[]> {
    return this.tokenModel.find({ estate: query.estateId }).exec();
  }
}
