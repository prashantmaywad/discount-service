import { Request, Response, NextFunction } from 'express';
import { PromotionController } from '../promotionController';
import { PromotionService } from '../../services/promotionService';
import { AppError } from '../../middleware/errorHandler';
import { DiscountType } from '../../types';

jest.mock('../../services/promotionService');

describe('PromotionController', () => {
  let promotionController: PromotionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const mockPromotion = {
    _id: 'promotion-id',
    code: 'PROMO123',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 15,
    expirationDate: new Date('2025-12-31'),
    usageLimit: 200,
    usedCount: 0,
    eligibleProductIds: ['prod1'],
    eligibleProductCategories: ['electronics'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    promotionController = new PromotionController();
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

  describe('getPromotions', () => {
    it('should return all promotions', async () => {
      const mockPromotions = [mockPromotion];
      (PromotionService.prototype.getPromotions as jest.Mock).mockResolvedValue(mockPromotions);

      await promotionController.getPromotions(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Promotions retrieved successfully',
        data: mockPromotions,
        count: 1,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should filter by isActive when query param provided', async () => {
      mockRequest.query = { isActive: 'true' };
      const mockPromotions = [mockPromotion];
      (PromotionService.prototype.getPromotions as jest.Mock).mockResolvedValue(mockPromotions);

      await promotionController.getPromotions(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(PromotionService.prototype.getPromotions).toHaveBeenCalledWith({ isActive: true });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (PromotionService.prototype.getPromotions as jest.Mock).mockRejectedValue(error);

      await promotionController.getPromotions(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getPromotionById', () => {
    it('should return promotion by id', async () => {
      mockRequest.params = { id: 'promotion-id' };
      (PromotionService.prototype.getPromotionById as jest.Mock).mockResolvedValue(mockPromotion);

      await promotionController.getPromotionById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Promotion retrieved successfully',
        data: mockPromotion,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 404 if promotion not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (PromotionService.prototype.getPromotionById as jest.Mock).mockResolvedValue(null);

      await promotionController.getPromotionById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('createPromotion', () => {
    it('should create promotion successfully', async () => {
      mockRequest.body = {
        code: 'NEWPROMO',
        discountType: DiscountType.FIXED,
        discountValue: 25,
        expirationDate: '2025-12-31',
        usageLimit: 100,
      };
      (PromotionService.prototype.createPromotion as jest.Mock).mockResolvedValue(mockPromotion);

      await promotionController.createPromotion(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Promotion created successfully',
        data: mockPromotion,
      });
    });

    it('should handle duplicate code error', async () => {
      mockRequest.body = {
        code: 'EXISTING',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        expirationDate: '2025-12-31',
        usageLimit: 100,
      };
      const error = new Error('Promotion code already exists');
      (PromotionService.prototype.createPromotion as jest.Mock).mockRejectedValue(error);

      await promotionController.createPromotion(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(409);
    });
  });

  describe('updatePromotion', () => {
    it('should update promotion successfully', async () => {
      mockRequest.params = { id: 'promotion-id' };
      mockRequest.body = { discountValue: 30 };
      const updatedPromotion = { ...mockPromotion, discountValue: 30 };
      (PromotionService.prototype.updatePromotion as jest.Mock).mockResolvedValue(updatedPromotion);

      await promotionController.updatePromotion(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Promotion updated successfully',
        data: updatedPromotion,
      });
    });

    it('should return 404 if promotion not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { discountValue: 30 };
      (PromotionService.prototype.updatePromotion as jest.Mock).mockResolvedValue(null);

      await promotionController.updatePromotion(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });

    it('should handle duplicate code error', async () => {
      mockRequest.params = { id: 'promotion-id' };
      mockRequest.body = { code: 'EXISTING' };
      const error = new Error('Promotion code already exists');
      (PromotionService.prototype.updatePromotion as jest.Mock).mockRejectedValue(error);

      await promotionController.updatePromotion(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(409);
    });
  });

  describe('deletePromotion', () => {
    it('should delete promotion successfully', async () => {
      mockRequest.params = { id: 'promotion-id' };
      (PromotionService.prototype.deletePromotion as jest.Mock).mockResolvedValue(true);

      await promotionController.deletePromotion(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Promotion deleted successfully',
      });
    });

    it('should return 404 if promotion not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (PromotionService.prototype.deletePromotion as jest.Mock).mockResolvedValue(false);

      await promotionController.deletePromotion(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });
  });
});

