import { Router } from 'express';
import { PromotionController } from '../controllers/promotionController';
import { validate } from '../middleware/validation';
import { strictLimiter } from '../middleware/rateLimiter';
import {
  createPromotionValidator,
  updatePromotionValidator,
} from '../validators/promotionValidator';

const router = Router();
const promotionController = new PromotionController();

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotions]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of promotions
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
 *                     $ref: '#/components/schemas/Promotion'
 *                 count:
 *                   type: integer
 */
router.get('/', promotionController.getPromotions.bind(promotionController));

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get promotion by ID
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion ID
 *     responses:
 *       200:
 *         description: Promotion details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Promotion not found
 */
router.get('/:id', promotionController.getPromotionById.bind(promotionController));

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create a new promotion
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Promotion code already exists
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */
router.post(
  '/',
  strictLimiter,
  validate(createPromotionValidator),
  promotionController.createPromotion.bind(promotionController)
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update a promotion
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               eligibleProductCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               eligibleProductIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *               usageLimit:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Promotion not found
 *       409:
 *         description: Promotion code already exists
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */
router.put(
  '/:id',
  strictLimiter,
  validate(updatePromotionValidator),
  promotionController.updatePromotion.bind(promotionController)
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete a promotion
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion ID
 *     responses:
 *       200:
 *         description: Promotion deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Promotion not found
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */
router.delete('/:id', strictLimiter, promotionController.deletePromotion.bind(promotionController));

export default router;

