import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllTokensQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from '../../../entities/token.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { TokenResponseDto } from '../../../dto/response/token.response.dto';

@QueryHandler(FindAllTokensQuery)
export class FindAllTokensHandler implements IQueryHandler<FindAllTokensQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindAllTokensQuery): Promise<TokenResponseDto[]> {
    const tokens = await this.tokenModel.find().exec();
    return tokens.map(token => 
      plainToInstance(TokenResponseDto, token.toObject(), { excludeExtraneousValues: true })
    );
  }
}
