import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindLevyByIdQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(FindLevyByIdQuery)
export class FindLevyByIdHandler implements IQueryHandler<FindLevyByIdQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: FindLevyByIdQuery): Promise<Levy> {
    const { id, estateId } = query;
    const levy = await this.levyModel
      .findOne({ _id: id, estateId })
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!levy) {
      throw new NotFoundException(`Levy with ID ${id} not found`);
    }

    return levy;
  }
}
