import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LevyResponseDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  dueDate: Date;

  @ApiProperty()
  @Expose()
  estateId: string;

  @ApiProperty({ type: [String] })
  @Expose()
  applicableRoles: string[];

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  enforcesTokenRestriction: boolean;

  @ApiProperty()
  @Expose()
  gracePeriodDays: number;

  @ApiProperty({ required: false })
  @Expose()
  notes?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
