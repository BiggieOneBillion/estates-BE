import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllPropertiesQuery } from '../impl/find-all-properties.query';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from '../../../entities/property.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { plainToInstance } from 'class-transformer';
import { PropertyResponseDto } from '../../../dto/response/property.response.dto';

@QueryHandler(FindAllPropertiesQuery)
export class FindAllPropertiesHandler implements IQueryHandler<FindAllPropertiesQuery> {
  constructor(
    @InjectModel(Property.name) private readonly propertyModel: SoftDeleteModel<Property>,
  ) {}

  async execute(query: FindAllPropertiesQuery): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyModel.find().exec();
    return properties.map(property => 
      plainToInstance(PropertyResponseDto, property.toObject(), { excludeExtraneousValues: true })
    );
  }
}
