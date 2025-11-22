import { Router } from 'express';
import { VoucherController } from '../controllers/voucherController';
import { validate } from '../middleware/validation';
import {
  createVoucherValidator,
  updateVoucherValidator,
} from '../validators/voucherValidator';

const router = Router();
const voucherController = new VoucherController();

router.get('/', voucherController.getVouchers.bind(voucherController));

router.post('/',
  validate(createVoucherValidator),
  voucherController.createVoucher.bind(voucherController)
);

router.get('/:id', voucherController.getVoucherById.bind(voucherController));

router.put(
  '/:id',
  validate(updateVoucherValidator),
  voucherController.updateVoucher.bind(voucherController)
);

router.delete('/:id', voucherController.deleteVoucher.bind(voucherController));

export default router;

