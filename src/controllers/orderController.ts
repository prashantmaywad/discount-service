import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { AppError } from '../middleware/errorHandler';

const orderService = new OrderService();

export class OrderController {
  async applyDiscounts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.applyDiscounts(req.body);
      res.status(200).json({
        message: 'Discounts applied successfully',
        data: result,
      });
    } catch (error: any) {
      if (
        error.message.includes('Invalid voucher') ||
        error.message.includes('Invalid promotion') ||
        error.message.includes('Duplicate')
      ) {
        return next(new AppError(error.message, 400));
      }
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.orderId);
      if (!order) {
        return next(new AppError('Order not found', 404));
      }
      res.json({
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getAllOrders();
      res.json({
        message: 'Orders retrieved successfully',
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

