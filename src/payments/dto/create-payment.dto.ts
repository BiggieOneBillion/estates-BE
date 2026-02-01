import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  levyId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  proofOfPayment?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  paymentDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
