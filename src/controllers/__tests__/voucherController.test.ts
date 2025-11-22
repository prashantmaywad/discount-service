import { Request, Response, NextFunction } from 'express';
import { VoucherController } from '../voucherController';
import { VoucherService } from '../../services/voucherService';
import { AppError } from '../../middleware/errorHandler';
import { DiscountType } from '../../types';

jest.mock('../../services/voucherService');

describe('VoucherController', () => {
  let voucherController: VoucherController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const mockVoucher = {
    _id: 'voucher-id',
    code: 'TESTCODE',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    expirationDate: new Date('2025-12-31'),
    usageLimit: 100,
    usedCount: 0,
    minimumOrderValue: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    voucherController = new VoucherController();
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

  describe('getVouchers', () => {
    it('should return all vouchers', async () => {
      const mockVouchers = [mockVoucher];
      (VoucherService.prototype.getVouchers as jest.Mock).mockResolvedValue(mockVouchers);

      await voucherController.getVouchers(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Vouchers retrieved successfully',
        data: mockVouchers,
        count: 1,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should filter by isActive when query param provided', async () => {
      mockRequest.query = { isActive: 'true' };
      const mockVouchers = [mockVoucher];
      (VoucherService.prototype.getVouchers as jest.Mock).mockResolvedValue(mockVouchers);

      await voucherController.getVouchers(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(VoucherService.prototype.getVouchers).toHaveBeenCalledWith({ isActive: true });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (VoucherService.prototype.getVouchers as jest.Mock).mockRejectedValue(error);

      await voucherController.getVouchers(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getVoucherById', () => {
    it('should return voucher by id', async () => {
      mockRequest.params = { id: 'voucher-id' };
      (VoucherService.prototype.getVoucherById as jest.Mock).mockResolvedValue(mockVoucher);

      await voucherController.getVoucherById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Voucher retrieved successfully',
        data: mockVoucher,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 404 if voucher not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (VoucherService.prototype.getVoucherById as jest.Mock).mockResolvedValue(null);

      await voucherController.getVoucherById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('createVoucher', () => {
    it('should create voucher successfully', async () => {
      mockRequest.body = {
        code: 'NEWCODE',
        discountType: DiscountType.FIXED,
        discountValue: 20,
        expirationDate: '2025-12-31',
        usageLimit: 50,
      };
      (VoucherService.prototype.createVoucher as jest.Mock).mockResolvedValue(mockVoucher);

      await voucherController.createVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Voucher created successfully',
        data: mockVoucher,
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
      const error = new Error('Voucher code already exists');
      (VoucherService.prototype.createVoucher as jest.Mock).mockRejectedValue(error);

      await voucherController.createVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(409);
    });

    it('should handle other errors', async () => {
      mockRequest.body = {};
      const error = new Error('Validation error');
      (VoucherService.prototype.createVoucher as jest.Mock).mockRejectedValue(error);

      await voucherController.createVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('updateVoucher', () => {
    it('should update voucher successfully', async () => {
      mockRequest.params = { id: 'voucher-id' };
      mockRequest.body = { discountValue: 25 };
      const updatedVoucher = { ...mockVoucher, discountValue: 25 };
      (VoucherService.prototype.updateVoucher as jest.Mock).mockResolvedValue(updatedVoucher);

      await voucherController.updateVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Voucher updated successfully',
        data: updatedVoucher,
      });
    });

    it('should return 404 if voucher not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { discountValue: 25 };
      (VoucherService.prototype.updateVoucher as jest.Mock).mockResolvedValue(null);

      await voucherController.updateVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });

    it('should handle duplicate code error', async () => {
      mockRequest.params = { id: 'voucher-id' };
      mockRequest.body = { code: 'EXISTING' };
      const error = new Error('Voucher code already exists');
      (VoucherService.prototype.updateVoucher as jest.Mock).mockRejectedValue(error);

      await voucherController.updateVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(409);
    });
  });

  describe('deleteVoucher', () => {
    it('should delete voucher successfully', async () => {
      mockRequest.params = { id: 'voucher-id' };
      (VoucherService.prototype.deleteVoucher as jest.Mock).mockResolvedValue(true);

      await voucherController.deleteVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Voucher deleted successfully',
      });
    });

    it('should return 404 if voucher not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (VoucherService.prototype.deleteVoucher as jest.Mock).mockResolvedValue(false);

      await voucherController.deleteVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: 'voucher-id' };
      const error = new Error('Database error');
      (VoucherService.prototype.deleteVoucher as jest.Mock).mockRejectedValue(error);

      await voucherController.deleteVoucher(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});

