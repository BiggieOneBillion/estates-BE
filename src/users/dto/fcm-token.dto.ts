import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsString()
  @IsOptional()
  deviceId?: string; // Optional device identifier
}

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  email?: boolean;

  @IsOptional()
  push?: boolean;

  @IsOptional()
  sms?: boolean;
}
