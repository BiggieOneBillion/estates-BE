import { IsEmail, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class EmailVerificationData {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The verification code sent to the user email',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    type: EmailVerificationData,
    description: 'Data containing email and verification code',
  })
  @ValidateNested()
  @Type(() => EmailVerificationData)
  @IsNotEmpty()
  data: EmailVerificationData;
}
