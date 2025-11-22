import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { validate } from '../middleware/validation';
import { applyDiscountValidator } from '../validators/orderValidator';

const router = Router();
const orderController = new OrderController();

router.get('/', orderController.getAllOrders.bind(orderController));

router.get('/:orderId', orderController.getOrderById.bind(orderController));

router.post(
  '/apply-discounts',
  validate(applyDiscountValidator),
  orderController.applyDiscounts.bind(orderController)
);

export default router;

