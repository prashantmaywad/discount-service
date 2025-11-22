import { Order, IOrderDocument } from '../models/Order';
import { VoucherService } from './voucherService';
import { PromotionService } from './promotionService';
import { ApplyDiscountRequest, ApplyDiscountResponse, IOrderItem, DiscountType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  private voucherService: VoucherService;
  private promotionService: PromotionService;
  private readonly MAX_DISCOUNT_PERCENTAGE = 50; // Maximum 50% discount

  constructor() {
    this.voucherService = new VoucherService();
    this.promotionService = new PromotionService();
  }


  private calculateSubtotal(items: IOrderItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

 
  private calculateDiscount(
    discountType: DiscountType,
    discountValue: number,
    applicableAmount: number
  ): number {
    if (discountType === DiscountType.PERCENTAGE) {
      return (applicableAmount * discountValue) / 100;
    } else {
      return Math.min(discountValue, applicableAmount);
    }
  }

 
  async applyDiscounts(
    request: ApplyDiscountRequest
  ): Promise<ApplyDiscountResponse> {
    const { items, voucherCodes = [], promotionCodes = [] } = request;
    const orderId = request.orderId || uuidv4();

    const uniqueVouchers = [...new Set(voucherCodes)];
    const uniquePromotions = [...new Set(promotionCodes)];

    if (uniqueVouchers.length !== voucherCodes.length) {
      throw new Error('Duplicate voucher codes are not allowed');
    }

    if (uniquePromotions.length !== promotionCodes.length) {
      throw new Error('Duplicate promotion codes are not allowed');
    }

    const subtotal = this.calculateSubtotal(items);
    const appliedVouchers: string[] = [];
    const appliedPromotions: string[] = [];
    const voucherDiscounts: Array<{ code: string; discount: number }> = [];
    const promotionDiscounts: Array<{ code: string; discount: number }> = [];
    let totalDiscount = 0;
    let remainingAmount = subtotal;

    for (const voucherCode of uniqueVouchers) {
      const validation = await this.voucherService.validateVoucher(
        voucherCode,
        subtotal
      );

      if (!validation.valid || !validation.voucher) {
        throw new Error(`Invalid voucher ${voucherCode}: ${validation.error}`);
      }

      const voucher = validation.voucher;
      const discount = this.calculateDiscount(
        voucher.discountType,
        voucher.discountValue,
        remainingAmount
      );

      appliedVouchers.push(voucherCode.toUpperCase());
      voucherDiscounts.push({ code: voucherCode.toUpperCase(), discount });
      totalDiscount += discount;
      remainingAmount -= discount;
    }

    for (const promotionCode of uniquePromotions) {
      const validation = await this.promotionService.validatePromotion(
        promotionCode,
        items
      );

      if (!validation.valid || !validation.promotion) {
        throw new Error(`Invalid promotion ${promotionCode}: ${validation.error}`);
      }

      const promotion = validation.promotion;
      
      let eligibleAmount = 0;
      items.forEach((item) => {
        const isEligible =
          (promotion.eligibleProductIds &&
            promotion.eligibleProductIds.includes(item.productId)) ||
          (promotion.eligibleProductCategories &&
            item.category &&
            promotion.eligibleProductCategories.includes(item.category)) ||
          (!promotion.eligibleProductIds?.length &&
            !promotion.eligibleProductCategories?.length);

        if (isEligible) {
          eligibleAmount += item.price * item.quantity;
        }
      });

      const discount = this.calculateDiscount(
        promotion.discountType,
        promotion.discountValue,
        eligibleAmount
      );

      appliedPromotions.push(promotionCode.toUpperCase());
      promotionDiscounts.push({ code: promotionCode.toUpperCase(), discount });
      totalDiscount += discount;
      remainingAmount -= discount;
    }

    const maxAllowedDiscount = (subtotal * this.MAX_DISCOUNT_PERCENTAGE) / 100;
    if (totalDiscount > maxAllowedDiscount) {
      totalDiscount = maxAllowedDiscount;
    }

    const finalAmount = Math.max(0, subtotal - totalDiscount);
    for (const code of appliedVouchers) {
      await this.voucherService.incrementUsage(code);
    }

    for (const code of appliedPromotions) {
      await this.promotionService.incrementUsage(code);
    }
    const order = new Order({
      orderId,
      items,
      subtotal,
      appliedVouchers,
      appliedPromotions,
      totalDiscount,
      finalAmount,
    });

    await order.save();

    return {
      orderId,
      subtotal,
      appliedVouchers,
      appliedPromotions,
      totalDiscount,
      finalAmount,
      discountBreakdown: {
        voucherDiscounts,
        promotionDiscounts,
      },
    };
  }


  async getOrderById(orderId: string): Promise<IOrderDocument | null> {
    return await Order.findOne({ orderId });
  }


  async getAllOrders(): Promise<IOrderDocument[]> {
    return await Order.find().sort({ createdAt: -1 });
  }
}

