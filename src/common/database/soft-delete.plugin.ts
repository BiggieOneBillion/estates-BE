import { Schema, Document, Model, Query } from 'mongoose';

export interface SoftDeleteDocument extends Document {
  isDeleted: boolean;
  deletedAt?: Date;
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

export interface SoftDeleteModel<T extends SoftDeleteDocument> extends Model<T> {
  softDelete(filter: any): Promise<any>;
  findDeleted(): Query<T[], T>;
  restore(filter: any): Promise<any>;
}

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  // Middleware to filter out deleted documents
  const filterNonDeleted = function (this: any) {
    const filter = this.getFilter();
    if (filter.isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
  };

  schema.pre('find', filterNonDeleted);
  schema.pre('findOne', filterNonDeleted);
  schema.pre('findOneAndUpdate', filterNonDeleted);
  schema.pre('updateOne', filterNonDeleted);
  schema.pre('updateMany', filterNonDeleted);
  schema.pre('countDocuments', filterNonDeleted);
  schema.pre('aggregate', function (this: any) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  });

  // Soft delete method
  schema.methods.softDelete = async function (this: SoftDeleteDocument) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  // Restore method
  schema.methods.restore = async function (this: SoftDeleteDocument) {
    this.isDeleted = false;
    this.deletedAt = undefined;
    return this.save();
  };

  // Static method to soft delete
  schema.statics.softDelete = function (filter: any) {
    return this.updateMany(filter, { isDeleted: true, deletedAt: new Date() });
  };

  // Static method to find deleted documents
  schema.statics.findDeleted = function () {
    return this.find({ isDeleted: true });
  };

  // Static method to restore documents
  schema.statics.restore = function (filter: any) {
    return this.updateMany(filter, { isDeleted: false, deletedAt: null });
  };
}
