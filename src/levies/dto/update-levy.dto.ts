import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLevyDto } from './create-levy.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLevyDto extends PartialType(CreateLevyDto) {
  @ApiPropertyOptional({ description: 'Active status of the levy', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
