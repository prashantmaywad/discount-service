import { body } from 'express-validator';
import { DiscountType } from '../types';

export const createPromotionValidator = [
  body('code')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Promotion code must be between 3 and 50 characters'),
  body('eligibleProductCategories')
    .optional()
    .isArray()
    .withMessage('Eligible product categories must be an array'),
  body('eligibleProductCategories.*')
    .optional()
    .isString()
    .withMessage('Each category must be a string'),
  body('eligibleProductIds')
    .optional()
    .isArray()
    .withMessage('Eligible product IDs must be an array'),
  body('eligibleProductIds.*')
    .optional()
    .isString()
    .withMessage('Each product ID must be a string'),
  body('discountType')
    .isIn([DiscountType.PERCENTAGE, DiscountType.FIXED])
    .withMessage('Discount type must be either "percentage" or "fixed"'),
  body('discountValue')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('expirationDate')
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
  body('usageLimit')
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updatePromotionValidator = [
  body('code')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Promotion code must be between 3 and 50 characters'),
  body('eligibleProductCategories')
    .optional()
    .isArray()
    .withMessage('Eligible product categories must be an array'),
  body('eligibleProductCategories.*')
    .optional()
    .isString()
    .withMessage('Each category must be a string'),
  body('eligibleProductIds')
    .optional()
    .isArray()
    .withMessage('Eligible product IDs must be an array'),
  body('eligibleProductIds.*')
    .optional()
    .isString()
    .withMessage('Each product ID must be a string'),
  body('discountType')
    .optional()
    .isIn([DiscountType.PERCENTAGE, DiscountType.FIXED])
    .withMessage('Discount type must be either "percentage" or "fixed"'),
  body('discountValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('expirationDate')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

