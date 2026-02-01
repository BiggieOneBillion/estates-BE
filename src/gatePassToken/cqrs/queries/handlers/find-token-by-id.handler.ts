import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTokenByIdQuery } from '../impl/token-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from '../../../entities/token.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TokenResponseDto } from '../../../dto/response/token.response.dto';

@QueryHandler(FindTokenByIdQuery)
export class FindTokenByIdHandler implements IQueryHandler<FindTokenByIdQuery> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
  ) {}

  async execute(query: FindTokenByIdQuery): Promise<TokenResponseDto> {
    const token = await this.tokenModel.findById(query.id).exec();
    if (!token) {
      throw new NotFoundException(`Token with ID ${query.id} not found`);
    }
    return plainToInstance(TokenResponseDto, token.toObject(), { excludeExtraneousValues: true });
  }
}
