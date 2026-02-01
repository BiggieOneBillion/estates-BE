import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationResponseDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  user: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty({ required: false })
  @Expose()
  data?: any;

  @ApiProperty()
  @Expose()
  read: boolean;

  @ApiProperty({ required: false })
  @Expose()
  readAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
