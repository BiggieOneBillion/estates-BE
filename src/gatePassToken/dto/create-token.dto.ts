import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TokenType, VisitorType } from '../entities/token.entity';

export class CreateTokenDto {
  @ApiPropertyOptional({ description: 'The generated token string (optional, auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the visitor' })
  @IsNotEmpty()
  @IsString()
  visitorName: string;

  @ApiPropertyOptional({ enum: VisitorType, default: VisitorType.OTHER, description: 'Category of the visitor' })
  @IsOptional()
  @IsEnum(VisitorType)
  visitorType?: VisitorType = VisitorType.OTHER;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Total number of visitors' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  numberOfVisitors?: number = 1;

  @ApiPropertyOptional({ example: false, default: false, description: 'Whether the visitor has a vehicle' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasCar?: boolean = false;

  @ApiPropertyOptional({ example: 'ABC-123-XY', description: 'Vehicle plate number' })
  @IsOptional()
  @IsString()
  carPlateNumber?: string;

  @ApiPropertyOptional({ example: 'Toyota Camry', description: 'Vehicle model' })
  @IsOptional()
  @IsString()
  carModel?: string;

  @ApiPropertyOptional({ example: 'Silver', description: 'Vehicle color' })
  @IsOptional()
  @IsString()
  carColor?: string;

  @ApiPropertyOptional({ example: 'Visiting a friend', description: 'Purpose of the visit' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ example: '60f1a5b8e1234567890abcde', description: 'Estate ID' })
  @IsNotEmpty()
  @IsMongoId()
  estate: string;

  @ApiPropertyOptional({ example: '60f1a5b8e1234567890abcde', description: 'Property ID (if applicable)' })
  @IsOptional()
  @IsMongoId()
  property?: string;

  @ApiPropertyOptional({ example: 'National ID', description: 'Type of identification provided' })
  @IsOptional()
  @IsString()
  meansOfId?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/ids/visitor.jpg', description: 'URL to identification image' })
  @IsOptional()
  @IsString()
  idImgUrl?: string;

  @ApiPropertyOptional({ description: 'Token expiration date and time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiPropertyOptional({ example: false, description: 'Whether the token has been used' })
  @IsOptional()
  @IsBoolean()
  used?: boolean;

  @ApiPropertyOptional({ example: false, default: false, description: 'Whether to require visitor verification' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  verifyVisitor?: boolean = false;
}

