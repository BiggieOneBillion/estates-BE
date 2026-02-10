import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenResponseDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  user: string;

  @ApiProperty()
  @Expose()
  token: string;

  @ApiProperty()
  @Expose()
  visitorName: string;

  @ApiProperty()
  @Expose()
  visitorType: string;

  @ApiProperty()
  @Expose()
  numberOfVisitors: number;

  @ApiProperty()
  @Expose()
  hasCar: boolean;

  @ApiProperty()
  @Expose()
  verifyVisitor: boolean;

  @ApiProperty({ required: false })
  @Expose()
  carPlateNumber?: string;

  @ApiProperty({ required: false })
  @Expose()
  carModel?: string;

  @ApiProperty({ required: false })
  @Expose()
  carColor?: string;

  @ApiProperty({ required: false })
  @Expose()
  purpose?: string;

  @ApiProperty()
  @Expose()
  estate: string;

  @ApiProperty({ required: false })
  @Expose()
  property?: string;

  @ApiProperty()
  @Expose()
  expiresAt: Date;

  @ApiProperty()
  @Expose()
  used: boolean;

  @ApiProperty({ required: false })
  @Expose()
  meansOfId?: string;

  @ApiProperty({ required: false })
  @Expose()
  usedAt?: Date;

  @ApiProperty()
  @Expose()
  hasUserVerifiedVisitor: string;

  @ApiProperty({ required: false })
  @Expose()
  verifiedBy?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
