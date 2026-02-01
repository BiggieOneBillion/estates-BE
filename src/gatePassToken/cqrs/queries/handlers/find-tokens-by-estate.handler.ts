import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTokensByEstateQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from '../../../entities/token.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { TokenResponseDto } from '../../../dto/response/token.response.dto';

@QueryHandler(FindTokensByEstateQuery)
export class FindTokensByEstateHandler implements IQueryHandler<FindTokensByEstateQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindTokensByEstateQuery): Promise<TokenResponseDto[]> {
    const tokens = await this.tokenModel.find({ estate: query.estateId }).exec();
    return tokens.map(token => 
      plainToInstance(TokenResponseDto, token.toObject(), { excludeExtraneousValues: true })
    );
  }
}
