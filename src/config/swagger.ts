import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';
import path from 'path';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Discount Service API',
    version: '1.0.0',
    description: 'API for managing vouchers, promotions, and applying discounts to orders',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Vouchers',
      description: 'Voucher management endpoints',
    },
    {
      name: 'Promotions',
      description: 'Promotion management endpoints',
    },
    {
      name: 'Orders',
      description: 'Order and discount application endpoints',
    },
  ],
  components: {
    schemas: {
      Voucher: {
        type: 'object',
        required: ['discountType', 'discountValue', 'expirationDate', 'usageLimit'],
        properties: {
          code: {
            type: 'string',
            description: 'Voucher code (auto-generated if not provided)',
            example: 'SAVE20',
          },
          discountType: {
            type: 'string',
            enum: ['percentage', 'fixed'],
            description: 'Type of discount',
            example: 'percentage',
          },
          discountValue: {
            type: 'number',
            description: 'Discount value (percentage or fixed amount)',
            example: 20,
          },
          expirationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Expiration date',
            example: '2024-12-31T23:59:59Z',
          },
          usageLimit: {
            type: 'integer',
            description: 'Maximum number of times the voucher can be used',
            example: 100,
          },
          minimumOrderValue: {
            type: 'number',
            description: 'Minimum order value required to use this voucher',
            example: 50,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the voucher is active',
            example: true,
          },
        },
      },
      Promotion: {
        type: 'object',
        required: ['discountType', 'discountValue', 'expirationDate', 'usageLimit'],
        properties: {
          code: {
            type: 'string',
            description: 'Promotion code (auto-generated if not provided)',
            example: 'SUMMER2024',
          },
          eligibleProductCategories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Product categories eligible for this promotion',
            example: ['electronics', 'clothing'],
          },
          eligibleProductIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific product IDs eligible for this promotion',
            example: ['prod1', 'prod2'],
          },
          discountType: {
            type: 'string',
            enum: ['percentage', 'fixed'],
            description: 'Type of discount',
            example: 'percentage',
          },
          discountValue: {
            type: 'number',
            description: 'Discount value (percentage or fixed amount)',
            example: 15,
          },
          expirationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Expiration date',
            example: '2024-12-31T23:59:59Z',
          },
          usageLimit: {
            type: 'integer',
            description: 'Maximum number of times the promotion can be used',
            example: 500,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the promotion is active',
            example: true,
          },
        },
      },
      OrderItem: {
        type: 'object',
        required: ['productId', 'productName', 'price', 'quantity'],
        properties: {
          productId: {
            type: 'string',
            example: 'prod123',
          },
          productName: {
            type: 'string',
            example: 'Laptop',
          },
          category: {
            type: 'string',
            example: 'electronics',
          },
          price: {
            type: 'number',
            example: 999.99,
          },
          quantity: {
            type: 'integer',
            example: 1,
          },
        },
      },
      ApplyDiscountRequest: {
        type: 'object',
        required: ['items'],
        properties: {
          orderId: {
            type: 'string',
            description: 'Order ID (auto-generated if not provided)',
          },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
          voucherCodes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of voucher codes to apply',
            example: ['SAVE20'],
          },
          promotionCodes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of promotion codes to apply',
            example: ['SUMMER2024'],
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'array',
            items: { type: 'object' },
            description: 'Validation error details',
          },
        },
      },
    },
  },
};

// Resolve paths - works in both dev (ts-node) and production (compiled)
const isProduction = __dirname.includes('dist');
const routesPath = isProduction
  ? path.join(__dirname, '../routes/*.js')
  : path.join(__dirname, '../routes/*.ts');

const options = {
  definition: swaggerDefinition,
  apis: [routesPath],
};

export const swaggerSpec = swaggerJsdoc(options);

