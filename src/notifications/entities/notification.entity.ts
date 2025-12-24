import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum NotificationType {
  TOKEN_UPDATED = 'token_updated',
  TOKEN_VERIFIED = 'token_verified',
  TOKEN_EXPIRED = 'token_expired',
  VISITOR_VERIFIED = 'visitor_verified',
  VERIFY_VISTOR = 'verify_vistor',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: string; // The user who should receive the notification

  // @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Token' })
  // tokenId: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  message: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  data: any; // Additional data related to the notification

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Date })
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
