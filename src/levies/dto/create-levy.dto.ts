import { IsString, IsNotEmpty, IsNumber, IsDate, IsEnum, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LevyType } from '../entities/levy.entity';
import { UserRole } from '../../users/entities/user.entity';

export class CreateLevyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(LevyType)
  @IsNotEmpty()
  type: LevyType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  applicableRoles: UserRole[];

  @IsBoolean()
  @IsOptional()
  enforcesTokenRestriction?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gracePeriodDays?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
