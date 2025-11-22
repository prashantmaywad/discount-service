import { Request, Response, NextFunction } from 'express';
import { VoucherService } from '../services/voucherService';
import { AppError } from '../middleware/errorHandler';

const voucherService = new VoucherService();

export class VoucherController {
    async getVouchers(req: Request, res: Response, next: NextFunction) {
    try {
      const isActive = req.query.isActive
        ? req.query.isActive === 'true'
        : undefined;
      const vouchers = await voucherService.getVouchers({ isActive });
      res.json({
        message: 'Vouchers retrieved successfully',
        data: vouchers,
        count: vouchers.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVoucherById(req: Request, res: Response, next: NextFunction) {
    try {
      const voucher = await voucherService.getVoucherById(req.params.id);
      if (!voucher) {
        return next(new AppError('Voucher not found', 404));
      }
      res.json({
        message: 'Voucher retrieved successfully',
        data: voucher,
      });
    } catch (error) {
      next(error);
    }
  }
  async createVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const voucher = await voucherService.createVoucher(req.body);
      res.status(201).json({
        message: 'Voucher created successfully',
        data: voucher,
      });
    } catch (error: any) {
      if (error.message === 'Voucher code already exists') {
        return next(new AppError(error.message, 409));
      }
      next(error);
    }
  }

  async updateVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const voucher = await voucherService.updateVoucher(req.params.id, req.body);
      if (!voucher) {
        return next(new AppError('Voucher not found', 404));
      }
      res.json({
        message: 'Voucher updated successfully',
        data: voucher,
      });
    } catch (error: any) {
      if (error.message === 'Voucher code already exists') {
        return next(new AppError(error.message, 409));
      }
      next(error);
    }
  }

  async deleteVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await voucherService.deleteVoucher(req.params.id);
      if (!deleted) {
        return next(new AppError('Voucher not found', 404));
      }
      res.json({
        message: 'Voucher deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

