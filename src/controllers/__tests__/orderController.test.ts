import { Request, Response, NextFunction } from 'express';
import { OrderController } from '../orderController';
import { OrderService } from '../../services/orderService';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../services/orderService');

describe('OrderController', () => {
  let orderController: OrderController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const mockOrderItems = [
    {
      productId: 'prod1',
      productName: 'Product 1',
      price: 100,
      quantity: 2,
    },
  ];

  const mockOrderResponse = {
    orderId: 'order-123',
    subtotal: 200,
    appliedVouchers: ['VOUCHER1'],
    appliedPromotions: [],
    totalDiscount: 20,
    finalAmount: 180,
    discountBreakdown: {
      voucherDiscounts: [{ code: 'VOUCHER1', discount: 20 }],
      promotionDiscounts: [],
    },
  };

  const mockOrder = {
    orderId: 'order-123',
    items: mockOrderItems,
    subtotal: 200,
    appliedVouchers: ['VOUCHER1'],
    appliedPromotions: [],
    totalDiscount: 20,
    finalAmount: 180,
    createdAt: new Date(),
  };

  beforeEach(() => {
    orderController = new OrderController();
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('applyDiscounts', () => {
    it('should apply discounts successfully', async () => {
      mockRequest.body = {
        items: mockOrderItems,
        voucherCodes: ['voucher1'],
      };
      (OrderService.prototype.applyDiscounts as jest.Mock).mockResolvedValue(mockOrderResponse);

      await orderController.applyDiscounts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Discounts applied successfully',
        data: mockOrderResponse,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle invalid voucher error', async () => {
      mockRequest.body = {
        items: mockOrderItems,
        voucherCodes: ['invalid'],
      };
      const error = new Error('Invalid voucher invalid: Voucher not found');
      (OrderService.prototype.applyDiscounts as jest.Mock).mockRejectedValue(error);

      await orderController.applyDiscounts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(400);
    });

    it('should handle invalid promotion error', async () => {
      mockRequest.body = {
        items: mockOrderItems,
        promotionCodes: ['invalid'],
      };
      const error = new Error('Invalid promotion invalid: Promotion not found');
      (OrderService.prototype.applyDiscounts as jest.Mock).mockRejectedValue(error);

      await orderController.applyDiscounts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(400);
    });

    it('should handle duplicate codes error', async () => {
      mockRequest.body = {
        items: mockOrderItems,
        voucherCodes: ['voucher1', 'voucher1'],
      };
      const error = new Error('Duplicate voucher codes are not allowed');
      (OrderService.prototype.applyDiscounts as jest.Mock).mockRejectedValue(error);

      await orderController.applyDiscounts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(400);
    });

    it('should handle other errors', async () => {
      mockRequest.body = {
        items: mockOrderItems,
      };
      const error = new Error('Database error');
      (OrderService.prototype.applyDiscounts as jest.Mock).mockRejectedValue(error);

      await orderController.applyDiscounts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      mockRequest.params = { orderId: 'order-123' };
      (OrderService.prototype.getOrderById as jest.Mock).mockResolvedValue(mockOrder);

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order retrieved successfully',
        data: mockOrder,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 404 if order not found', async () => {
      mockRequest.params = { orderId: 'nonexistent' };
      (OrderService.prototype.getOrderById as jest.Mock).mockResolvedValue(null);

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });

    it('should handle errors', async () => {
      mockRequest.params = { orderId: 'order-123' };
      const error = new Error('Database error');
      (OrderService.prototype.getOrderById as jest.Mock).mockRejectedValue(error);

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const mockOrders = [mockOrder];
      (OrderService.prototype.getAllOrders as jest.Mock).mockResolvedValue(mockOrders);

      await orderController.getAllOrders(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Orders retrieved successfully',
        data: mockOrders,
        count: 1,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (OrderService.prototype.getAllOrders as jest.Mock).mockRejectedValue(error);

      await orderController.getAllOrders(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});

