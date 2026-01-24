import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from '../../users/entities/user.entity';

export enum LevyType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ONE_TIME = 'one-time',
}

export enum LevyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Levy extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: LevyType })
  type: LevyType;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Estate', required: true })
  estateId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [String],
    enum: UserRole,
    default: [UserRole.LANDLORD, UserRole.TENANT],
  })
  applicableRoles: UserRole[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  enforcesTokenRestriction: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  gracePeriodDays: number; // Days after due date before enforcement

  @Prop()
  notes?: string;
}

export const LevySchema = SchemaFactory.createForClass(Levy);

// Indexes for better query performance
LevySchema.index({ estateId: 1, isActive: 1 });
LevySchema.index({ dueDate: 1 });
LevySchema.index({ estateId: 1, applicableRoles: 1, isActive: 1 });
