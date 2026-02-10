import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTokenByStringQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from '../../../entities/token.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TokenResponseDto } from '../../../dto/response/token.response.dto';

@QueryHandler(FindTokenByStringQuery)
export class FindTokenByStringHandler implements IQueryHandler<FindTokenByStringQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindTokenByStringQuery): Promise<TokenResponseDto> {
    const token = await this.tokenModel.findOne({ token: query.tokenString }).exec();
    if (!token) {
      throw new NotFoundException(`Token ${query.tokenString} not found`);
    }
    return plainToInstance(TokenResponseDto, token.toObject(), { excludeExtraneousValues: true });
  }
}
