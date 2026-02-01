import { PartialType } from '@nestjs/swagger';
import { CreateUserRequestDto } from './create-user.request.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserRequestDto extends PartialType(CreateUserRequestDto) {
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;
}
