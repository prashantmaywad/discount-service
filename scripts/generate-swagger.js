const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const fs = require('fs');

const swaggerDefinition = {
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

const routesPath = path.join(__dirname, '../src/routes/*.ts');

const options = {
  definition: swaggerDefinition,
  apis: [routesPath],
};

try {
  const swaggerSpec = swaggerJsdoc(options);
  const rootPath = path.join(__dirname, '..');
  const outputPath = path.join(rootPath, 'swagger.json');
  const distPath = path.join(rootPath, 'dist', 'swagger.json');
  
  // Write to root
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
  console.log('✓ Swagger JSON generated at:', outputPath);
  
  // Also copy to dist folder for Vercel
  if (fs.existsSync(path.join(rootPath, 'dist'))) {
    fs.writeFileSync(distPath, JSON.stringify(swaggerSpec, null, 2));
    console.log('✓ Swagger JSON copied to dist folder');
  }
} catch (error) {
  console.error('Error generating Swagger JSON:', error);
  process.exit(1);
}

