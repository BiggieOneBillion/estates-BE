import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindEstateByIdQuery } from '../impl/find-estate-by-id.query';
import { InjectModel } from '@nestjs/mongoose';
import { Estate } from '../../../entities/estate.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EstateResponseDto } from '../../../dto/response/estate.response.dto';

@QueryHandler(FindEstateByIdQuery)
export class FindEstateByIdHandler implements IQueryHandler<FindEstateByIdQuery> {
  constructor(
    @InjectModel(Estate.name) private readonly estateModel: SoftDeleteModel<Estate>,
  ) {}

  async execute(query: FindEstateByIdQuery): Promise<EstateResponseDto> {
    const estate = await this.estateModel.findById(query.id).exec();
    if (!estate) {
      throw new NotFoundException(`Estate with ID ${query.id} not found`);
    }
    return plainToInstance(EstateResponseDto, estate.toObject(), { excludeExtraneousValues: true });
  }
}
