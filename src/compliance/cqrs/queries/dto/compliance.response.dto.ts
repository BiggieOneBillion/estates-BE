import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { LevyResponseDto } from '../../../../levies/dto/response/levy.response.dto';

export class ComplianceStatusDto {
  @ApiProperty()
  @Expose()
  isCompliant: boolean;

  @ApiProperty()
  @Expose()
  canCreateToken: boolean;

  @ApiProperty({ type: [LevyResponseDto] })
  @Expose()
  @Type(() => LevyResponseDto)
  outstandingLevies: LevyResponseDto[];

  @ApiProperty()
  @Expose()
  totalOutstanding: number;
}

export class UserComplianceDetailDto {
  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  isCompliant: boolean;

  @ApiProperty()
  @Expose()
  outstandingAmount: number;

  @ApiProperty()
  @Expose()
  outstandingLeviesCount: number;
}

export class EstateComplianceReportDto {
  @ApiProperty()
  @Expose()
  totalUsers: number;

  @ApiProperty()
  @Expose()
  compliantUsers: number;

  @ApiProperty()
  @Expose()
  nonCompliantUsers: number;

  @ApiProperty()
  @Expose()
  totalOutstanding: number;

  @ApiProperty({ type: [UserComplianceDetailDto] })
  @Expose()
  @Type(() => UserComplianceDetailDto)
  userDetails: UserComplianceDetailDto[];
}
