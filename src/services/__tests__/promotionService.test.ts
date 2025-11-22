import { PromotionService } from '../promotionService';
import { Promotion } from '../../models/Promotion';
import { DiscountType } from '../../types';

jest.mock('../../models/Promotion');

describe('PromotionService', () => {
  let promotionService: PromotionService;
  const mockPromotion = {
    _id: 'promotion-id',
    code: 'PROMO123',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 15,
    expirationDate: new Date('2025-12-31'),
    usageLimit: 200,
    usedCount: 0,
    eligibleProductIds: ['prod1', 'prod2'],
    eligibleProductCategories: ['electronics'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  beforeEach(() => {
    promotionService = new PromotionService();
    jest.clearAllMocks();
  });

  describe('createPromotion', () => {
    it('should create a promotion with provided code', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(null);
      (Promotion as any).mockImplementation((data: any) => ({
        ...mockPromotion,
        ...data,
        save: jest.fn().mockResolvedValue({ ...mockPromotion, ...data }),
      }));

      const data = {
        code: 'NEWPROMO',
        discountType: DiscountType.FIXED,
        discountValue: 25,
        expirationDate: new Date('2025-12-31'),
        usageLimit: 100,
      };

      const result = await promotionService.createPromotion(data);

      expect(Promotion.findOne).toHaveBeenCalledWith({ code: 'NEWPROMO' });
      expect(result.code).toBe('NEWPROMO');
    });

    it('should generate a code if not provided', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(null);
      (Promotion as any).mockImplementation((data: any) => ({
        ...mockPromotion,
        code: data.code || 'GENERATED',
        save: jest.fn().mockResolvedValue({ ...mockPromotion, code: data.code || 'GENERATED' }),
      }));

      const data = {
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        expirationDate: new Date('2025-12-31'),
        usageLimit: 150,
      };

      const result = await promotionService.createPromotion(data);

      expect(result.code).toBeDefined();
      expect(result.usedCount).toBe(0);
      expect(result.isActive).toBe(true);
    });

    it('should throw error if code already exists', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(mockPromotion);

      const data = {
        code: 'PROMO123',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        expirationDate: new Date('2025-12-31'),
        usageLimit: 200,
      };

      await expect(promotionService.createPromotion(data)).rejects.toThrow(
        'Promotion code already exists'
      );
    });
  });

  describe('getPromotions', () => {
    it('should return all promotions when no filter provided', async () => {
      (Promotion.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockPromotion]),
      });

      const result = await promotionService.getPromotions();

      expect(Promotion.find).toHaveBeenCalledWith({});
      expect(result).toEqual([mockPromotion]);
    });

    it('should filter by isActive when provided', async () => {
      (Promotion.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockPromotion]),
      });

      await promotionService.getPromotions({ isActive: true });

      expect(Promotion.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('getPromotionByCode', () => {
    it('should return promotion by code', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(mockPromotion);

      const result = await promotionService.getPromotionByCode('promo123');

      expect(Promotion.findOne).toHaveBeenCalledWith({ code: 'PROMO123' });
      expect(result).toEqual(mockPromotion);
    });
  });

  describe('getPromotionById', () => {
    it('should return promotion by id', async () => {
      (Promotion.findById as jest.Mock).mockResolvedValue(mockPromotion);

      const result = await promotionService.getPromotionById('promotion-id');

      expect(Promotion.findById).toHaveBeenCalledWith('promotion-id');
      expect(result).toEqual(mockPromotion);
    });
  });

  describe('updatePromotion', () => {
    it('should update promotion successfully', async () => {
      const updatedPromotion = { ...mockPromotion, discountValue: 30 };
      (Promotion.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedPromotion);
      (Promotion.findOne as jest.Mock).mockResolvedValue(null);

      const result = await promotionService.updatePromotion('promotion-id', {
        discountValue: 30,
      });

      expect(result).toEqual(updatedPromotion);
    });

    it('should throw error if new code already exists', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(mockPromotion);

      await expect(
        promotionService.updatePromotion('promotion-id', { code: 'EXISTING' })
      ).rejects.toThrow('Promotion code already exists');
    });
  });

  describe('deletePromotion', () => {
    it('should delete promotion and return true', async () => {
      (Promotion.findByIdAndDelete as jest.Mock).mockResolvedValue(mockPromotion);

      const result = await promotionService.deletePromotion('promotion-id');

      expect(result).toBe(true);
    });

    it('should return false if promotion not found', async () => {
      (Promotion.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await promotionService.deletePromotion('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('validatePromotion', () => {
    it('should return valid for a valid promotion', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(mockPromotion);

      const orderItems = [
        { productId: 'prod1', category: 'electronics' },
        { productId: 'prod3', category: 'clothing' },
      ];

      const result = await promotionService.validatePromotion('PROMO123', orderItems);

      expect(result.valid).toBe(true);
      expect(result.promotion).toEqual(mockPromotion);
    });

    it('should return invalid if promotion not found', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(null);

      const result = await promotionService.validatePromotion('INVALID', []);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Promotion not found');
    });

    it('should return invalid if promotion is not active', async () => {
      const inactivePromotion = { ...mockPromotion, isActive: false };
      (Promotion.findOne as jest.Mock).mockResolvedValue(inactivePromotion);

      const result = await promotionService.validatePromotion('PROMO123', [
        { productId: 'prod1' },
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Promotion is not active');
    });

    it('should return invalid if promotion has expired', async () => {
      const expiredPromotion = {
        ...mockPromotion,
        expirationDate: new Date('2020-01-01'),
      };
      (Promotion.findOne as jest.Mock).mockResolvedValue(expiredPromotion);

      const result = await promotionService.validatePromotion('PROMO123', [
        { productId: 'prod1' },
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Promotion has expired');
    });

    it('should return invalid if usage limit exceeded', async () => {
      const limitExceededPromotion = {
        ...mockPromotion,
        usedCount: 200,
        usageLimit: 200,
      };
      (Promotion.findOne as jest.Mock).mockResolvedValue(limitExceededPromotion);

      const result = await promotionService.validatePromotion('PROMO123', [
        { productId: 'prod1' },
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Promotion usage limit exceeded');
    });

    it('should return invalid if no eligible items in order', async () => {
      (Promotion.findOne as jest.Mock).mockResolvedValue(mockPromotion);

      const orderItems = [
        { productId: 'prod99', category: 'clothing' },
        { productId: 'prod100', category: 'books' },
      ];

      const result = await promotionService.validatePromotion('PROMO123', orderItems);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Promotion does not apply to any items in the order');
    });

    it('should validate promotion with category eligibility', async () => {
      const categoryPromotion = {
        ...mockPromotion,
        eligibleProductIds: [],
        eligibleProductCategories: ['electronics'],
      };
      (Promotion.findOne as jest.Mock).mockResolvedValue(categoryPromotion);

      const orderItems = [
        { productId: 'prod99', category: 'electronics' },
        { productId: 'prod100', category: 'books' },
      ];

      const result = await promotionService.validatePromotion('PROMO123', orderItems);

      expect(result.valid).toBe(true);
    });

    it('should validate promotion with no restrictions (applies to all)', async () => {
      const universalPromotion = {
        ...mockPromotion,
        eligibleProductIds: [],
        eligibleProductCategories: [],
      };
      (Promotion.findOne as jest.Mock).mockResolvedValue(universalPromotion);

      const orderItems = [{ productId: 'any-product' }];

      const result = await promotionService.validatePromotion('PROMO123', orderItems);

      expect(result.valid).toBe(true);
    });
  });

  describe('incrementUsage', () => {
    it('should increment promotion usage count', async () => {
      (Promotion.findOneAndUpdate as jest.Mock).mockResolvedValue(mockPromotion);

      await promotionService.incrementUsage('promo123');

      expect(Promotion.findOneAndUpdate).toHaveBeenCalledWith(
        { code: 'PROMO123' },
        { $inc: { usedCount: 1 } }
      );
    });
  });
});

