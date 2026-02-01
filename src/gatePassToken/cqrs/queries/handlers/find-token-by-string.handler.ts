import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTokenByStringQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token } from '../../../entities/token.entity';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(FindTokenByStringQuery)
export class FindTokenByStringHandler implements IQueryHandler<FindTokenByStringQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindTokenByStringQuery): Promise<Token> {
    const token = await this.tokenModel.findOne({ token: query.tokenString }).exec();
    if (!token) {
      throw new NotFoundException(`Token ${query.tokenString} not found`);
    }
    return token;
  }
}
