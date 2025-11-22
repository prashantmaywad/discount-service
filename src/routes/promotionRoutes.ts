import { Router } from 'express';
import { PromotionController } from '../controllers/promotionController';
import { validate } from '../middleware/validation';
import {
  createPromotionValidator,
  updatePromotionValidator,
} from '../validators/promotionValidator';

const router = Router();
const promotionController = new PromotionController();

router.get('/', promotionController.getPromotions.bind(promotionController));

router.get('/:id', promotionController.getPromotionById.bind(promotionController));

router.post(
  '/',
  validate(createPromotionValidator),
  promotionController.createPromotion.bind(promotionController)
);

router.put(
  '/:id',
  validate(updatePromotionValidator),
  promotionController.updatePromotion.bind(promotionController)
);

router.delete('/:id', promotionController.deletePromotion.bind(promotionController));

export default router;

