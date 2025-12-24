import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose, Schema as MongooseSchema } from 'mongoose';

export enum SubscriptionPlan {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  FREE = 'free',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

const now = new Date();

@Schema({ timestamps: true })
export class Estate extends Document {
  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  owner?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    type: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
  })
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };

  @Prop({
    type: {
      plan: {
        type: String,
        enum: Object.values(SubscriptionPlan),
        default: SubscriptionPlan.FREE,
      },
      startDate: { type: Date, default: Date.now },
      endDate: {
        type: Date,
        default: new Date(now.setFullYear(now.getFullYear() + 1)),
      },
      status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.ACTIVE,
      },
    },
  })
  subscription: {
    plan: SubscriptionPlan;
    startDate: Date;
    endDate?: Date;
    status: SubscriptionStatus;
  };

  @Prop({
    type: [
      {
        filename: String,
        fileType: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  supportingDocuments?: {
    filename: string;
    fileType: string;
    url: string;
    uploadedAt?: Date;
  }[];

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const EstateSchema = SchemaFactory.createForClass(Estate);
