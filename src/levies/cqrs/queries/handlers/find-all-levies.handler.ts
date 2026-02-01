import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllLeviesQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { Levy } from '../../../entities/levy.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { LevyResponseDto } from '../../../dto/response/levy.response.dto';

@QueryHandler(FindAllLeviesQuery)
export class FindAllLeviesHandler implements IQueryHandler<FindAllLeviesQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: FindAllLeviesQuery): Promise<LevyResponseDto[]> {
    const levies = await this.levyModel.find().exec();
    return levies.map(levy => 
      plainToInstance(LevyResponseDto, levy.toObject(), { excludeExtraneousValues: true })
    );
  }
}
