import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllPropertiesQuery } from '../impl/find-all-properties.query';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from '../../../entities/property.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';

@QueryHandler(FindAllPropertiesQuery)
export class FindAllPropertiesHandler implements IQueryHandler<FindAllPropertiesQuery> {
  constructor(
    @InjectModel(Property.name) private readonly propertyModel: SoftDeleteModel<Property>,
  ) {}

  async execute(query: FindAllPropertiesQuery): Promise<Property[]> {
    const filter = query.estateId ? { estate: query.estateId } : {};
    return this.propertyModel.find(filter).exec();
  }
}
