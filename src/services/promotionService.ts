import { Promotion, IPromotionDocument } from '../models/Promotion';
import { IPromotion } from '../types';

export class PromotionService {
  private generatePromotionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createPromotion(data: Partial<IPromotion>): Promise<IPromotionDocument> {
    const code = data.code || this.generatePromotionCode();
    const existing = await Promotion.findOne({ code: code.toUpperCase() });
    if (existing) {
      throw new Error('Promotion code already exists');
    }

    const promotion = new Promotion({
      ...data,
      code: code.toUpperCase(),
      usedCount: 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return await promotion.save();
  }

  async getPromotions(filters?: { isActive?: boolean }): Promise<IPromotionDocument[]> {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return await Promotion.find(query).sort({ createdAt: -1 });
  }

  async getPromotionByCode(code: string): Promise<IPromotionDocument | null> {
    return await Promotion.findOne({ code: code.toUpperCase() });
  }

  async getPromotionById(id: string): Promise<IPromotionDocument | null> {
    return await Promotion.findById(id);
  }

  async updatePromotion(
    id: string,
    data: Partial<IPromotion>
  ): Promise<IPromotionDocument | null> {
    if (data.code) {
      const existing = await Promotion.findOne({
        code: data.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new Error('Promotion code already exists');
      }
      data.code = data.code.toUpperCase();
    }

    return await Promotion.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deletePromotion(id: string): Promise<boolean> {
    const result = await Promotion.findByIdAndDelete(id);
    return !!result;
  }

  async validatePromotion(
    code: string,
    orderItems: Array<{ productId: string; category?: string }>
  ): Promise<{ valid: boolean; promotion: IPromotionDocument | null; error?: string }> {
    const promotion = await this.getPromotionByCode(code);
    
    if (!promotion) {
      return { valid: false, promotion: null, error: 'Promotion not found' };
    }

    if (!promotion.isActive) {
      return { valid: false, promotion, error: 'Promotion is not active' };
    }

    const now = new Date();
    if (promotion.expirationDate < now) {
      return { valid: false, promotion, error: 'Promotion has expired' };
    }

    if (promotion.usedCount >= promotion.usageLimit) {
      return { valid: false, promotion, error: 'Promotion usage limit exceeded' };
    }

    const hasEligibleItems = orderItems.some((item) => {
      if (promotion.eligibleProductIds && promotion.eligibleProductIds.length > 0) {
        return promotion.eligibleProductIds.includes(item.productId);
      }
      if (promotion.eligibleProductCategories && promotion.eligibleProductCategories.length > 0) {
        return item.category && promotion.eligibleProductCategories.includes(item.category);
      }
      return true;
    });

    if (!hasEligibleItems) {
      return {
        valid: false,
        promotion,
        error: 'Promotion does not apply to any items in the order',
      };
    }

    return { valid: true, promotion };
  }

  async incrementUsage(code: string): Promise<void> {
    await Promotion.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  }
}

