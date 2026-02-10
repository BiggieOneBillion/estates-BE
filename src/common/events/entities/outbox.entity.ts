// src/common/events/entities/outbox.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OutboxEventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class OutboxEvent extends Document {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true, index: true })
  eventType: string;

  @Prop({ required: true })
  aggregateId: string;

  @Prop({ required: true })
  aggregateType: string;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ required: true, index: true })
  correlationId: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({
    type: String,
    enum: OutboxEventStatus,
    default: OutboxEventStatus.PENDING,
    index: true,
  })
  status: OutboxEventStatus;

  @Prop({ type: Map, of: String, default: {} })
  handlerStatus: Map<string, string>; // handlerName -> status (completed, failed)

  @Prop({ default: 0 })
  retryCount: number;

  @Prop({ default: 5 })
  maxRetries: number;

  @Prop({ type: Date, index: true })
  nextRetryAt?: Date;

  @Prop()
  error?: string;

  @Prop()
  processedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEvent);

// Add indexes for efficient querying
OutboxEventSchema.index({ status: 1, nextRetryAt: 1 });
OutboxEventSchema.index({ eventType: 1, createdAt: -1 });
OutboxEventSchema.index({ aggregateId: 1, aggregateType: 1 });
