// src/gatePassToken/entities/token.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum TokenType {
  GATE_PASS = 'gate_pass',
  RESET_PASSWORD = 'reset_password',
  EMAIL_VERIFICATION = 'email_verification',
  REFRESH = 'refresh',
}

export enum VisitorType {
  FAMILY = 'family',
  FRIEND = 'friend',
  SERVICE_PROVIDER = 'service_provider',
  DELIVERY = 'delivery',
  OTHER = 'other',
}

export enum MeansOfIdentification {
  DRIVERS_LICENCES = 'driversLicence',
  NIN = 'nin',
  VOTERS_CARD = 'votersCard',
  INTERNATIONAL_PASSPORT = 'internationalPassport',
  OTHERS = 'others',
}

export enum hasUserVerifiedVisitorStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  UNVERIFIED = 'unverified',
}

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: string; // The user who created the gate pass (landlord, admin, or tenant)

  @Prop({ required: true })
  token: string; // Unique token identifier

  // @Prop({ required: true, enum: TokenType, default: TokenType.GATE_PASS })
  // type: TokenType;

  @Prop({ required: true })
  visitorName: string;

  @Prop({ enum: VisitorType, default: VisitorType.OTHER })
  visitorType: VisitorType;

  @Prop({ default: 1 })
  numberOfVisitors: number;

  @Prop({ default: false })
  hasCar: boolean;

  @Prop({ default: false })
  verifyVisitor: boolean;

  @Prop()
  carPlateNumber?: string;

  @Prop()
  carModel?: string;

  @Prop()
  carColor?: string;

  @Prop()
  purpose?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Estate' })
  estate: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Property' })
  property?: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop()
  meansOfId?: MeansOfIdentification;

  @Prop()
  idImgUrl?: string;

  @Prop()
  usedAt?: Date;

  @Prop({ default: hasUserVerifiedVisitorStatus.UNVERIFIED })
  hasUserVerifiedVisitor: hasUserVerifiedVisitorStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  verifiedBy?: string; // Security personnel who verified the token
}

export const TokenSchema = SchemaFactory.createForClass(Token);
