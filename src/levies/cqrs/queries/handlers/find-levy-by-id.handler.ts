import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindLevyByIdQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Levy } from '../../../entities/levy.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LevyResponseDto } from '../../../dto/response/levy.response.dto';

@QueryHandler(FindLevyByIdQuery)
export class FindLevyByIdHandler implements IQueryHandler<FindLevyByIdQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: FindLevyByIdQuery): Promise<LevyResponseDto> {
    const levy = await this.levyModel.findById(query.id).exec();
    if (!levy) {
      throw new NotFoundException(`Levy with ID ${query.id} not found`);
    }
    return plainToInstance(LevyResponseDto, levy.toObject(), { excludeExtraneousValues: true });
  }
}
