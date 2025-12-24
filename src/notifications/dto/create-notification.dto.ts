import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsBoolean()
  read?: boolean = false;
}