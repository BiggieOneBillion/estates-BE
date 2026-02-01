import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTokensByUserQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token } from '../../../entities/token.entity';

@QueryHandler(FindTokensByUserQuery)
export class FindTokensByUserHandler implements IQueryHandler<FindTokensByUserQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindTokensByUserQuery): Promise<Token[]> {
    return this.tokenModel.find({ user: query.userId }).exec();
  }
}
