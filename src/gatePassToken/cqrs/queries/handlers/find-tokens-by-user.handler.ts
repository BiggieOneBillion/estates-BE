import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTokensByUserQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from '../../../entities/token.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { TokenResponseDto } from '../../../dto/response/token.response.dto';

@QueryHandler(FindTokensByUserQuery)
export class FindTokensByUserHandler implements IQueryHandler<FindTokensByUserQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindTokensByUserQuery): Promise<TokenResponseDto[]> {
    const tokens = await this.tokenModel.find({ user: query.userId }).exec();
    return tokens.map(token => 
      plainToInstance(TokenResponseDto, token.toObject(), { excludeExtraneousValues: true })
    );
  }
}
