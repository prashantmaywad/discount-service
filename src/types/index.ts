export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export interface IVoucher {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expirationDate: Date;
  usageLimit: number;
  usedCount: number;
  minimumOrderValue?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromotion {
  code: string;
  eligibleProductCategories?: string[];
  eligibleProductIds?: string[];
  discountType: DiscountType;
  discountValue: number;
  expirationDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  productId: string;
  productName: string;
  category?: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  orderId: string;
  items: IOrderItem[];
  subtotal: number;
  appliedVouchers: string[];
  appliedPromotions: string[];
  totalDiscount: number;
  finalAmount: number;
  createdAt: Date;
}

export interface ApplyDiscountRequest {
  orderId?: string;
  items: IOrderItem[];
  voucherCodes?: string[];
  promotionCodes?: string[];
}

export interface ApplyDiscountResponse {
  orderId: string;
  subtotal: number;
  appliedVouchers: string[];
  appliedPromotions: string[];
  totalDiscount: number;
  finalAmount: number;
  discountBreakdown: {
    voucherDiscounts: Array<{ code: string; discount: number }>;
    promotionDiscounts: Array<{ code: string; discount: number }>;
  };
}

