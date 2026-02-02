import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterFcmTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsString()
  @IsOptional()
  deviceId?: string; // Optional device identifier
}

export class UpdateNotificationPreferencesRequestDto {
  @IsOptional()
  email?: boolean;

  @IsOptional()
  push?: boolean;

  @IsOptional()
  sms?: boolean;
}
