import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllTokensQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token } from '../../../entities/token.entity';

@QueryHandler(FindAllTokensQuery)
export class FindAllTokensHandler implements IQueryHandler<FindAllTokensQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindAllTokensQuery): Promise<Token[]> {
    return this.tokenModel.find().exec();
  }
}
