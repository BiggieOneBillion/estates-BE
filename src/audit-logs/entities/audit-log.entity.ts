import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PERMISSION_CHANGE = 'permission_change',
  PAYMENT = 'payment',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  userId: MongooseSchema.Types.ObjectId | string;

  @Prop({ required: true, index: true })
  action: string; // e.g., 'user.created', 'payment.completed'

  @Prop({ required: true, index: true })
  resource: string; // e.g., 'User', 'Payment', 'Levy'

  @Prop({ index: true })
  resourceId?: string;

  @Prop({ type: Object })
  payload: any; // The data associated with the action

  @Prop({ type: Object })
  previousValues?: any; // For updates, store what changed

  @Prop({ type: Object })
  newValues?: any; // For updates, store new values

  @Prop({ type: Object })
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    estateId?: string;
  };

  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Add text search index for easier lookup
AuditLogSchema.index({ action: 'text', resource: 'text', resourceId: 'text' });
