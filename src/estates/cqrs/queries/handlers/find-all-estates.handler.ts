import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllEstatesQuery } from '../impl/find-all-estates.query';
import { InjectModel } from '@nestjs/mongoose';
import { Estate } from '../../../entities/estate.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { EstateResponseDto } from '../../../dto/response/estate.response.dto';

@QueryHandler(FindAllEstatesQuery)
export class FindAllEstatesHandler implements IQueryHandler<FindAllEstatesQuery> {
  constructor(
    @InjectModel(Estate.name) private readonly estateModel: SoftDeleteModel<Estate>,
  ) {}

  async execute(query: FindAllEstatesQuery): Promise<EstateResponseDto[]> {
    const estates = await this.estateModel.find().exec();
    return estates.map(estate => 
      plainToInstance(EstateResponseDto, estate.toObject(), { excludeExtraneousValues: true })
    );
  }
}
