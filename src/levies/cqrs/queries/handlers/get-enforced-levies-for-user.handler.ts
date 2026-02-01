import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEnforcedLeviesForUserQuery } from '../impl/levy-queries.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';
import { plainToInstance } from 'class-transformer';
import { LevyResponseDto } from '../../../dto/response/levy.response.dto';

@QueryHandler(GetEnforcedLeviesForUserQuery)
export class GetEnforcedLeviesForUserHandler implements IQueryHandler<GetEnforcedLeviesForUserQuery> {
  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(query: GetEnforcedLeviesForUserQuery): Promise<LevyResponseDto[]> {
    const { estateId, userRole } = query;
    const levies = await this.levyModel
      .find({
        estateId,
        isActive: true,
        applicableRoles: userRole,
        enforcesTokenRestriction: true,
      })
      .exec();
    
    return levies.map(levy => plainToInstance(LevyResponseDto, levy.toObject(), { excludeExtraneousValues: true }));
  }
}
