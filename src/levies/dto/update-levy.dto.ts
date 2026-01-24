import { PartialType } from '@nestjs/mapped-types';
import { CreateLevyDto } from './create-levy.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLevyDto extends PartialType(CreateLevyDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
