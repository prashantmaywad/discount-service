import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { validate } from '../middleware/validation';
import { applyDiscountValidator } from '../validators/orderValidator';

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                       items:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/OrderItem'
 *                       subtotal:
 *                         type: number
 *                       appliedVouchers:
 *                         type: array
 *                         items:
 *                           type: string
 *                       appliedPromotions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       totalDiscount:
 *                         type: number
 *                       finalAmount:
 *                         type: number
 *                 count:
 *                   type: integer
 */
router.get('/', orderController.getAllOrders.bind(orderController));

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderItem'
 *                     subtotal:
 *                       type: number
 *                     appliedVouchers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     appliedPromotions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     totalDiscount:
 *                       type: number
 *                     finalAmount:
 *                       type: number
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', orderController.getOrderById.bind(orderController));

/**
 * @swagger
 * /api/orders/apply-discounts:
 *   post:
 *     summary: Apply vouchers and promotions to an order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyDiscountRequest'
 *           example:
 *             items:
 *               - productId: "prod1"
 *                 productName: "Laptop"
 *                 category: "electronics"
 *                 price: 999.99
 *                 quantity: 1
 *             voucherCodes: ["SAVE20"]
 *             promotionCodes: ["SUMMER2024"]
 *     responses:
 *       200:
 *         description: Discounts applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     subtotal:
 *                       type: number
 *                     appliedVouchers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     appliedPromotions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     totalDiscount:
 *                       type: number
 *                     finalAmount:
 *                       type: number
 *                     discountBreakdown:
 *                       type: object
 *                       properties:
 *                         voucherDiscounts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               code:
 *                                 type: string
 *                               discount:
 *                                 type: number
 *                         promotionDiscounts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               code:
 *                                 type: string
 *                               discount:
 *                                 type: number
 *       400:
 *         description: Validation error or invalid voucher/promotion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/apply-discounts',
  validate(applyDiscountValidator),
  orderController.applyDiscounts.bind(orderController)
);

export default router;

