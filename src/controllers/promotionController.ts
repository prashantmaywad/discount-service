import { Request, Response, NextFunction } from 'express';
import { PromotionService } from '../services/promotionService';
import { AppError } from '../middleware/errorHandler';

const promotionService = new PromotionService();

export class PromotionController {
   async getPromotions(req: Request, res: Response, next: NextFunction) {
    try {
      const isActive = req.query.isActive
        ? req.query.isActive === 'true'
        : undefined;
      const promotions = await promotionService.getPromotions({ isActive });
      res.json({
        message: 'Promotions retrieved successfully',
        data: promotions,
        count: promotions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPromotionById(req: Request, res: Response, next: NextFunction) {
    try {
      const promotion = await promotionService.getPromotionById(req.params.id);
      if (!promotion) {
        return next(new AppError('Promotion not found', 404));
      }
      res.json({
        message: 'Promotion retrieved successfully',
        data: promotion,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async createPromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const promotion = await promotionService.createPromotion(req.body);
      res.status(201).json({
        message: 'Promotion created successfully',
        data: promotion,
      });
    } catch (error: any) {
      if (error.message === 'Promotion code already exists') {
        return next(new AppError(error.message, 409));
      }
      next(error);
    }
  }

  async updatePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const promotion = await promotionService.updatePromotion(
        req.params.id,
        req.body
      );
      if (!promotion) {
        return next(new AppError('Promotion not found', 404));
      }
      res.json({
        message: 'Promotion updated successfully',
        data: promotion,
      });
    } catch (error: any) {
      if (error.message === 'Promotion code already exists') {
        return next(new AppError(error.message, 409));
      }
      next(error);
    }
  }

  async deletePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await promotionService.deletePromotion(req.params.id);
      if (!deleted) {
        return next(new AppError('Promotion not found', 404));
      }
      res.json({
        message: 'Promotion deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

