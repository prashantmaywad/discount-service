import { OrderService } from '../orderService';
import { VoucherService } from '../voucherService';
import { PromotionService } from '../promotionService';
import { Order } from '../../models/Order';
import { DiscountType, IOrderItem } from '../../types';

jest.mock('../voucherService');
jest.mock('../promotionService');
jest.mock('../../models/Order');

describe('OrderService', () => {
  let orderService: OrderService;
  let mockVoucherService: jest.Mocked<VoucherService>;
  let mockPromotionService: jest.Mocked<PromotionService>;

  const mockVoucher = {
    _id: 'voucher-id',
    code: 'VOUCHER1',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    expirationDate: new Date('2025-12-31'),
    usageLimit: 100,
    usedCount: 0,
    minimumOrderValue: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPromotion = {
    _id: 'promotion-id',
    code: 'PROMO1',
    discountType: DiscountType.FIXED,
    discountValue: 5,
    expirationDate: new Date('2025-12-31'),
    usageLimit: 200,
    usedCount: 0,
    eligibleProductIds: ['prod1'],
    eligibleProductCategories: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItems: IOrderItem[] = [
    {
      productId: 'prod1',
      productName: 'Product 1',
      category: 'electronics',
      price: 100,
      quantity: 2,
    },
    {
      productId: 'prod2',
      productName: 'Product 2',
      category: 'clothing',
      price: 50,
      quantity: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mocked instances with all required methods
    const mockVoucherServiceInstance = {
      validateVoucher: jest.fn(),
      incrementUsage: jest.fn(),
      createVoucher: jest.fn(),
      getVouchers: jest.fn(),
      getVoucherByCode: jest.fn(),
      getVoucherById: jest.fn(),
      updateVoucher: jest.fn(),
      deleteVoucher: jest.fn(),
    };
    const mockPromotionServiceInstance = {
      validatePromotion: jest.fn(),
      incrementUsage: jest.fn(),
      createPromotion: jest.fn(),
      getPromotions: jest.fn(),
      getPromotionByCode: jest.fn(),
      getPromotionById: jest.fn(),
      updatePromotion: jest.fn(),
      deletePromotion: jest.fn(),
    };

    // Reset and setup service mocks
    (VoucherService as unknown as jest.Mock).mockImplementation(() => mockVoucherServiceInstance);
    (PromotionService as unknown as jest.Mock).mockImplementation(() => mockPromotionServiceInstance);

    // Setup Order mock as a constructor (default implementation)
    (Order as unknown as jest.Mock).mockImplementation((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue(data),
    }));
    
    // Setup Order static methods - reset them each time
    (Order.findOne as jest.Mock) = jest.fn();
    (Order.find as jest.Mock) = jest.fn();

    orderService = new OrderService();
    
    mockVoucherService = mockVoucherServiceInstance as jest.Mocked<VoucherService>;
    mockPromotionService = mockPromotionServiceInstance as jest.Mocked<PromotionService>;
  });

  describe('applyDiscounts', () => {
    it('should apply voucher discount successfully', async () => {
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: mockVoucher as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };

      const result = await orderService.applyDiscounts(request);

      expect(result.subtotal).toBe(250); // (100 * 2) + (50 * 1)
      expect(result.appliedVouchers).toContain('VOUCHER1');
      expect(result.totalDiscount).toBeGreaterThan(0);
      expect(result.finalAmount).toBeLessThan(result.subtotal);
      expect(mockVoucherService.validateVoucher).toHaveBeenCalledWith('voucher1', 250);
      expect(mockVoucherService.incrementUsage).toHaveBeenCalledWith('VOUCHER1');
    });

    it('should apply promotion discount successfully', async () => {
      mockPromotionService.validatePromotion.mockResolvedValue({
        valid: true,
        promotion: mockPromotion as any,
      });
      mockPromotionService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        promotionCodes: ['promo1'],
      };

      const result = await orderService.applyDiscounts(request);

      expect(result.appliedPromotions).toContain('PROMO1');
      expect(result.totalDiscount).toBeGreaterThan(0);
      expect(mockPromotionService.validatePromotion).toHaveBeenCalledWith('promo1', mockOrderItems);
      expect(mockPromotionService.incrementUsage).toHaveBeenCalledWith('PROMO1');
    });

    it('should apply both voucher and promotion discounts', async () => {
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: mockVoucher as any,
      });
      mockPromotionService.validatePromotion.mockResolvedValue({
        valid: true,
        promotion: mockPromotion as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();
      mockPromotionService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
        promotionCodes: ['promo1'],
      };

      const result = await orderService.applyDiscounts(request);

      expect(result.appliedVouchers.length).toBe(1);
      expect(result.appliedPromotions.length).toBe(1);
      expect(result.totalDiscount).toBeGreaterThan(0);
    });

    it('should calculate percentage discount correctly', async () => {
      const percentageVoucher = {
        ...mockVoucher,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
      };
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: percentageVoucher as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };

      const result = await orderService.applyDiscounts(request);

      // 20% of 250 = 50
      expect(result.totalDiscount).toBe(50);
      expect(result.finalAmount).toBe(200);
    });

    it('should calculate fixed discount correctly', async () => {
      const fixedVoucher = {
        ...mockVoucher,
        discountType: DiscountType.FIXED,
        discountValue: 30,
      };
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: fixedVoucher as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };

      const result = await orderService.applyDiscounts(request);

      expect(result.totalDiscount).toBe(30);
      expect(result.finalAmount).toBe(220);
    });

    it('should enforce maximum 50% discount limit', async () => {
      const highDiscountVoucher = {
        ...mockVoucher,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 60, // 60% discount
      };
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: highDiscountVoucher as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };

      const result = await orderService.applyDiscounts(request);

      // Max discount should be 50% of 250 = 125
      expect(result.totalDiscount).toBe(125);
      expect(result.finalAmount).toBe(125);
    });

    it('should throw error for duplicate voucher codes', async () => {
      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1', 'voucher1'],
      };

      await expect(orderService.applyDiscounts(request)).rejects.toThrow(
        'Duplicate voucher codes are not allowed'
      );
    });

    it('should throw error for duplicate promotion codes', async () => {
      const request = {
        items: mockOrderItems,
        promotionCodes: ['promo1', 'promo1'],
      };

      await expect(orderService.applyDiscounts(request)).rejects.toThrow(
        'Duplicate promotion codes are not allowed'
      );
    });

    it('should throw error for invalid voucher', async () => {
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: false,
        voucher: null,
        error: 'Voucher not found',
      });

      const request = {
        items: mockOrderItems,
        voucherCodes: ['invalid'],
      };

      await expect(orderService.applyDiscounts(request)).rejects.toThrow(
        'Invalid voucher invalid: Voucher not found'
      );
    });

    it('should throw error for invalid promotion', async () => {
      mockPromotionService.validatePromotion.mockResolvedValue({
        valid: false,
        promotion: null,
        error: 'Promotion not found',
      });

      const request = {
        items: mockOrderItems,
        promotionCodes: ['invalid'],
      };

      await expect(orderService.applyDiscounts(request)).rejects.toThrow(
        'Invalid promotion invalid: Promotion not found'
      );
    });

    it('should use provided orderId if given', async () => {
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: mockVoucher as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();
      const mockSave = jest.fn().mockResolvedValue({});
      (Order as unknown as jest.Mock).mockImplementation((data: any) => ({
        ...data,
        save: mockSave,
      }));

      const request = {
        orderId: 'custom-order-id',
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };

      const result = await orderService.applyDiscounts(request);

      expect(result.orderId).toBe('custom-order-id');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should generate orderId if not provided', async () => {
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: mockVoucher as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };

      const result = await orderService.applyDiscounts(request);

      expect(result.orderId).toBeDefined();
      expect(typeof result.orderId).toBe('string');
    });

    it('should calculate promotion discount only for eligible items', async () => {
      const categoryPromotion = {
        ...mockPromotion,
        eligibleProductIds: [],
        eligibleProductCategories: ['electronics'],
      };
      mockPromotionService.validatePromotion.mockResolvedValue({
        valid: true,
        promotion: categoryPromotion as any,
      });
      mockPromotionService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        promotionCodes: ['promo1'],
      };

      const result = await orderService.applyDiscounts(request);

      // Only prod1 (electronics) should be eligible: 100 * 2 = 200
      // Fixed discount of 5 on 200 = 5
      expect(result.totalDiscount).toBe(5);
    });

    it('should ensure final amount is never negative', async () => {
      const highDiscountVoucher = {
        ...mockVoucher,
        discountType: DiscountType.FIXED,
        discountValue: 1000, // Very high discount
      };
      mockVoucherService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: highDiscountVoucher as any,
      });
      mockVoucherService.incrementUsage.mockResolvedValue();

      const request = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };

      const result = await orderService.applyDiscounts(request);

      expect(result.finalAmount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const mockOrder = {
        orderId: 'order-123',
        items: mockOrderItems,
        subtotal: 250,
        appliedVouchers: [],
        appliedPromotions: [],
        totalDiscount: 0,
        finalAmount: 250,
      };
      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('order-123');

      expect(Order.findOne).toHaveBeenCalledWith({ orderId: 'order-123' });
      expect(result).toEqual(mockOrder);
    });

    it('should return null if order not found', async () => {
      (Order.findOne as jest.Mock).mockResolvedValue(null);

      const result = await orderService.getOrderById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders sorted by creation date', async () => {
      const mockOrders = [
        {
          orderId: 'order-1',
          items: mockOrderItems,
          subtotal: 250,
          appliedVouchers: [],
          appliedPromotions: [],
          totalDiscount: 0,
          finalAmount: 250,
        },
        {
          orderId: 'order-2',
          items: mockOrderItems,
          subtotal: 300,
          appliedVouchers: [],
          appliedPromotions: [],
          totalDiscount: 0,
          finalAmount: 300,
        },
      ];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOrders),
      });

      const result = await orderService.getAllOrders();

      expect(Order.find).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });
});

