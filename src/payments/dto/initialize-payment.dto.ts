import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsString()
  @IsNotEmpty()
  levyId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number; // Optional, will use levy amount if not provided
}
