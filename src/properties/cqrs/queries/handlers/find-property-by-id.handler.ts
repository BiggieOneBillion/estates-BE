import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPropertyByIdQuery } from '../impl/find-property-by-id.query';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from '../../../entities/property.entity';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PropertyResponseDto } from '../../../dto/response/property.response.dto';

@QueryHandler(FindPropertyByIdQuery)
export class FindPropertyByIdHandler implements IQueryHandler<FindPropertyByIdQuery> {
  constructor(
    @InjectModel(Property.name) private readonly propertyModel: SoftDeleteModel<Property>,
  ) {}

  async execute(query: FindPropertyByIdQuery): Promise<PropertyResponseDto> {
    const property = await this.propertyModel.findById(query.id).exec();
    if (!property) {
      throw new NotFoundException(`Property with ID ${query.id} not found`);
    }
    return plainToInstance(PropertyResponseDto, property.toObject(), { excludeExtraneousValues: true });
  }
}
