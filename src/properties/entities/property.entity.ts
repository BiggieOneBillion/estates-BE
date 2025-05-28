import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Estate } from '../../estates/entities/estate.entity';

export enum PropertyType {
  APARTMENT = 'apartment',
  DUPLEX = 'duplex',
  BUNGALOW = 'bungalow',
  COMMERCIAL = 'commercial',
}

export enum OccupancyStatus {
  VACANT = 'vacant',
  OCCUPIED = 'occupied',
}

@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({ required: true, trim: true })
  identifier: string;

  @Prop({ required: true, enum: PropertyType })
  type: PropertyType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  landlordId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Estate', required: true })
  estateId: Estate;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  tenantId?: User[];

  @Prop()
  size?: string;

  @Prop()
  bedrooms?: number;

  @Prop()
  bathrooms?: number;

  @Prop()
  description?: string;

  @Prop([String])
  photos?: string[];

  @Prop([{
    title: String,
    fileType: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }])
  documents?: {
    title: string;
    fileType: string;
    url: string;
    uploadedAt?: Date;
  }[];

  @Prop({ enum: OccupancyStatus, default: OccupancyStatus.VACANT })
  occupancyStatus: OccupancyStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);