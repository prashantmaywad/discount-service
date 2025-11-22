import mongoose, { Schema, Document } from 'mongoose';
import { IPromotion, DiscountType } from '../types';

export interface IPromotionDocument extends IPromotion, Document {}

const promotionSchema = new Schema<IPromotionDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    eligibleProductCategories: {
      type: [String],
      default: [],
    },
    eligibleProductIds: {
      type: [String],
      default: [],
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

promotionSchema.index({ expirationDate: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ eligibleProductCategories: 1 });
promotionSchema.index({ eligibleProductIds: 1 });

// Virtual to check if promotion is valid
promotionSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.expirationDate > now &&
    this.usedCount < this.usageLimit
  );
});

export const Promotion = mongoose.model<IPromotionDocument>('Promotion', promotionSchema);

