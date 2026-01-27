import { IsString, IsNotEmpty, IsNumber, IsDate, IsEnum, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LevyType } from '../entities/levy.entity';
import { UserRole } from '../../users/entities/user.entity';

export class CreateLevyDto {
  @ApiProperty({ description: 'Title of the levy' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description of the levy' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: LevyType, description: 'Type of the levy' })
  @IsEnum(LevyType)
  @IsNotEmpty()
  type: LevyType;

  @ApiProperty({ description: 'Amount to be paid', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Due date for the payment' })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({
    type: [String],
    enum: UserRole,
    description: 'Roles this levy applies to',
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  applicableRoles: UserRole[];

  @ApiPropertyOptional({
    description: 'Whether this levy enforces token restrictions if unpaid',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  enforcesTokenRestriction?: boolean;

  @ApiPropertyOptional({
    description: 'Number of grace period days after the due date',
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  gracePeriodDays?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
