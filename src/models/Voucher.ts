import mongoose, { Schema, Document } from 'mongoose';
import { IVoucher, DiscountType } from '../types';

export interface IVoucherDocument extends IVoucher, Document {}

const voucherSchema = new Schema<IVoucherDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

voucherSchema.index({ expirationDate: 1 });
voucherSchema.index({ isActive: 1 });
voucherSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.expirationDate > now &&
    this.usedCount < this.usageLimit
  );
});

export const Voucher = mongoose.model<IVoucherDocument>('Voucher', voucherSchema);

