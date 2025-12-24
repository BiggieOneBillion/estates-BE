// src/token/dto/update-token.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTokenDto } from './create-token.dto';
import { hasUserVerifiedVisitorStatus } from '../entities/token.entity';
import { IsOptional } from 'class-validator';

export class UpdateTokenDto extends PartialType(CreateTokenDto) {
  @IsOptional()
  hasUserVerifiedVisitor?: hasUserVerifiedVisitorStatus;
}
