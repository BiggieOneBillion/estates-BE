import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address for password reset',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
