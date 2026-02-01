import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuditLogMetadataDto {
  @ApiProperty({ required: false })
  @Expose()
  ipAddress?: string;

  @ApiProperty({ required: false })
  @Expose()
  userAgent?: string;

  @ApiProperty({ required: false })
  @Expose()
  estateId?: string;
}

export class AuditLogResponseDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  action: string;

  @ApiProperty()
  @Expose()
  resource: string;

  @ApiProperty({ required: false })
  @Expose()
  resourceId?: string;

  @ApiProperty({ type: AuditLogMetadataDto, required: false })
  @Expose()
  metadata?: AuditLogMetadataDto;

  @ApiProperty()
  @Expose()
  timestamp: Date;
}

export class AuditLogStatsDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  count: number;
}
