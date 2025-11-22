import { body } from 'express-validator';

export const applyDiscountValidator = [
  body('orderId')
    .optional()
    .isString()
    .withMessage('Order ID must be a string'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productId')
    .isString()
    .notEmpty()
    .withMessage('Each item must have a valid productId'),
  body('items.*.productName')
    .isString()
    .notEmpty()
    .withMessage('Each item must have a valid productName'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Each item must have a valid price (non-negative number)'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid quantity (positive integer)'),
  body('items.*.category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  body('voucherCodes')
    .optional()
    .isArray()
    .withMessage('Voucher codes must be an array'),
  body('voucherCodes.*')
    .optional()
    .isString()
    .withMessage('Each voucher code must be a string'),
  body('promotionCodes')
    .optional()
    .isArray()
    .withMessage('Promotion codes must be an array'),
  body('promotionCodes.*')
    .optional()
    .isString()
    .withMessage('Each promotion code must be a string'),
];

