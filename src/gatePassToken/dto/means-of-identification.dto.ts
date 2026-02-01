import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { MeansOfIdentification } from '../entities/token.entity';

export class MeansOfIdentificationDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsEnum(MeansOfIdentification)
  meansOfId: MeansOfIdentification;
}