import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from 'src/common/database/soft-delete.plugin';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  CHEQUE = 'cheque',
}

@Schema({ timestamps: true })
export class Payment extends Document implements SoftDeleteDocument {
  isDeleted: boolean;
  deletedAt?: Date;
  softDelete: () => Promise<this>;
  restore: () => Promise<this>;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Levy', required: true })
  levyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop()
  referenceNumber?: string;

  @Prop()
  proofOfPayment?: string; // URL to uploaded receipt/proof

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  verifiedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop()
  notes?: string;

  @Prop()
  paymentDate: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.plugin(softDeletePlugin);

// Indexes for better query performance
PaymentSchema.index({ userId: 1, levyId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ levyId: 1, status: 1 });
PaymentSchema.index({ userId: 1, status: 1 });
