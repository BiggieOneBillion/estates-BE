import { IsString, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectPaymentDto {
  @IsString()
  rejectionReason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
