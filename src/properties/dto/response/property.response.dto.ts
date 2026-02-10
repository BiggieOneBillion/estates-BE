import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PropertyResponseDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  identifier: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  landlordId: string;

  @ApiProperty()
  @Expose()
  estateId: string;

  @ApiProperty({ type: [String], required: false })
  @Expose()
  tenantId?: string[];

  @ApiProperty({ required: false })
  @Expose()
  size?: string;

  @ApiProperty({ required: false })
  @Expose()
  bedrooms?: number;

  @ApiProperty({ required: false })
  @Expose()
  bathrooms?: number;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ type: [String], required: false })
  @Expose()
  photos?: string[];

  @ApiProperty()
  @Expose()
  occupancyStatus: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
