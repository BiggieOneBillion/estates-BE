import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  city: string;

  @ApiProperty()
  @Expose()
  state: string;

  @ApiProperty()
  @Expose()
  country: string;

  @ApiProperty({ required: false })
  @Expose()
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export class SubscriptionDto {
  @ApiProperty()
  @Expose()
  plan: string;

  @ApiProperty()
  @Expose()
  startDate: Date;

  @ApiProperty({ required: false })
  @Expose()
  endDate?: Date;

  @ApiProperty()
  @Expose()
  status: string;
}

export class EstateResponseDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ type: LocationDto })
  @Expose()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ type: SubscriptionDto })
  @Expose()
  @Type(() => SubscriptionDto)
  subscription: SubscriptionDto;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @Expose()
  logo?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
