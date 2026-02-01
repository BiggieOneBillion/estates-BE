// src/common/events/entities/dead-letter-event.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DeadLetterEvent extends Document {
  @Prop({ required: true })
  originalEventId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  aggregateId: string;

  @Prop({ required: true })
  aggregateType: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ required: true })
  failureReason: string;

  @Prop({ required: true })
  retryCount: number;

  @Prop({ required: true })
  firstFailedAt: Date;

  @Prop({ required: true })
  lastFailedAt: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false })
  isResolved: boolean;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  resolvedBy?: string;

  @Prop()
  resolutionNotes?: string;
}

export const DeadLetterEventSchema =
  SchemaFactory.createForClass(DeadLetterEvent);

// Add indexes
DeadLetterEventSchema.index({ eventType: 1, isResolved: 1 });
DeadLetterEventSchema.index({ originalEventId: 1 }, { unique: true });
DeadLetterEventSchema.index({ createdAt: -1 });
