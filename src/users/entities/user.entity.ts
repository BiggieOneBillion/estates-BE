// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum UserRole {
  SITE_ADMIN = 'site_admin',
  SUPER_ADMIN = 'super_admin',
  ESTATE_ADMIN = 'estate_admin',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  SECURITY = 'security',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.TENANT] })
  roles: UserRole[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Estate', default: null })
  estateId: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profileImage: string;

  @Prop()
  lastLogin: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String })
  verificationToken: string | null;

  @Prop({
    default: function () {
      return !this.roles || !this.roles.includes(UserRole.SUPER_ADMIN);
    },
  })
  isTemporaryPassword: boolean;

  @Prop([
    {
      resource: String,
      actions: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    },
  ])
  permissions?: { resource: string; actions: string[] }[];

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
