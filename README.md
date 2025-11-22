# Discount Service API

A comprehensive RESTful API service for managing vouchers, promotions, and applying discounts to orders. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

- ✅ **Voucher Management**: Create, read, update, and delete vouchers
- ✅ **Promotion Management**: Create, read, update, and delete promotions
- ✅ **Order Processing**: Apply vouchers and promotions to orders with automatic discount calculation
- ✅ **Business Rules Enforcement**:
  - Expiration date validation
  - Usage limit tracking
  - Minimum order value requirements (for vouchers)
  - Product/category eligibility (for promotions)
  - Maximum discount cap (50% of subtotal)
  - Duplicate code prevention
- ✅ **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Input Validation**: Request validation using express-validator

## Tech Stack

- **Runtime**: Node.js v20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (MongoDB Atlas)
- **ODM**: Mongoose
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI (swagger-ui-express, swagger-jsdoc)
- **Environment**: dotenv

## Prerequisites

- Node.js v20 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discount-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Project Structure

```
discount-service/
├── src/
│   ├── config/          # Configuration files (database, swagger)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware (validation, error handling)
│   ├── models/           # Mongoose models (Voucher, Promotion, Order)
│   ├── routes/           # Express routes
│   ├── services/         # Business logic layer
│   ├── types/            # TypeScript interfaces and types
│   ├── validators/       # Request validation schemas
│   └── index.ts          # Application entry point
├── examples/             # Example payloads and documentation
├── dist/                 # Compiled JavaScript (generated)
└── package.json
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`

### Voucher Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vouchers` | Create a new voucher |
| GET | `/api/vouchers` | Get all vouchers |
| GET | `/api/vouchers/:id` | Get voucher by ID |
| PUT | `/api/vouchers/:id` | Update a voucher |
| DELETE | `/api/vouchers/:id` | Delete a voucher |

### Promotion Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/promotions` | Create a new promotion |
| GET | `/api/promotions` | Get all promotions |
| GET | `/api/promotions/:id` | Get promotion by ID |
| PUT | `/api/promotions/:id` | Update a promotion |
| DELETE | `/api/promotions/:id` | Delete a promotion |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/apply-discounts` | Apply vouchers/promotions to an order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:orderId` | Get order by ID |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## Quick Start Examples

### Create a Voucher

```bash
curl -X POST http://localhost:3000/api/vouchers \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "expirationDate": "2024-12-31T23:59:59Z",
    "usageLimit": 1000,
    "minimumOrderValue": 50,
    "isActive": true
  }'
```

### Create a Promotion

```bash
curl -X POST http://localhost:3000/api/promotions \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "SUMMER2024",
    "eligibleProductCategories": ["electronics", "clothing"],
    "discountType": "percentage",
    "discountValue": 15,
    "expirationDate": "2024-12-31T23:59:59Z",
    "usageLimit": 1000,
    "isActive": true
  }'
```

### Apply Discounts to an Order

```bash
curl -X POST http://localhost:3000/api/orders/apply-discounts \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      {
        "productId": "prod-001",
        "productName": "Laptop",
        "category": "electronics",
        "price": 999.99,
        "quantity": 1
      }
    ],
    "voucherCodes": ["SAVE20"],
    "promotionCodes": ["SUMMER2024"]
  }'
```

## Example Payloads

Comprehensive examples are available in the `examples/` directory:

- `examples/create-voucher-example.json` - Voucher payload example
- `examples/create-promotion-example.json` - Promotion payload example
- `examples/create-order-example.json` - Order payload example
- `examples/VOUCHER_PAYLOAD_GUIDE.md` - Complete voucher documentation
- `examples/PROMOTION_PAYLOAD_GUIDE.md` - Complete promotion documentation
- `examples/ORDER_PAYLOAD_GUIDE.md` - Complete order documentation

## Business Logic

### Vouchers
- Apply to the **entire order subtotal**
- Can have a minimum order value requirement
- No product restrictions
- Applied sequentially (each voucher reduces remaining amount)

### Promotions
- Apply only to **eligible items** (by category or product ID)
- No minimum order value
- Can target specific products or categories
- If no restrictions, applies to all items

### Discount Rules
1. **Maximum Discount**: Total discount is capped at 50% of order subtotal
2. **Validation**: All vouchers/promotions are validated before application
3. **Usage Tracking**: Usage counts are automatically incremented
4. **No Duplicates**: Same code cannot be used twice in one order

## Database Schema

### Voucher
- `code` (String, unique, required)
- `discountType` (enum: "percentage" | "fixed", required)
- `discountValue` (Number, required)
- `expirationDate` (Date, required)
- `usageLimit` (Number, required)
- `usedCount` (Number, default: 0)
- `minimumOrderValue` (Number, optional)
- `isActive` (Boolean, default: true)

### Promotion
- `code` (String, unique, required)
- `eligibleProductCategories` (Array of Strings, optional)
- `eligibleProductIds` (Array of Strings, optional)
- `discountType` (enum: "percentage" | "fixed", required)
- `discountValue` (Number, required)
- `expirationDate` (Date, required)
- `usageLimit` (Number, required)
- `usedCount` (Number, default: 0)
- `isActive` (Boolean, default: true)

### Order
- `orderId` (String, unique, required)
- `items` (Array of OrderItems, required)
- `subtotal` (Number, required)
- `appliedVouchers` (Array of Strings)
- `appliedPromotions` (Array of Strings)
- `totalDiscount` (Number, required)
- `finalAmount` (Number, required)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/drivelah` |
| `NODE_ENV` | Environment (development/production) | `development` |

## Scripts

```bash
# Development
npm run dev          # Run with ts-node (hot reload)

# Production
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled JavaScript

# Testing
npm test             # Run tests (to be implemented)
```

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": []  // Validation errors (if applicable)
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate code)
- `500` - Internal Server Error

## API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Complete endpoint documentation
- Request/response schemas
- Try-it-out functionality

## Deployment

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get the connection string
6. Update `MONGODB_URI` in `.env`

### Deployment Platforms

#### Render
1. Connect your GitHub repository
2. Set environment variables
3. Build command: `npm run build`
4. Start command: `npm start`

#### Heroku
1. Create a Heroku app
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy via Git

#### Vercel
1. Import project
2. Configure build settings
3. Set environment variables
4. Deploy

## Development

### Code Structure
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and data processing
- **Models**: Database schemas and models
- **Routes**: API route definitions
- **Validators**: Request validation rules
- **Middleware**: Error handling and validation middleware

### Adding New Features
1. Define types in `src/types/`
2. Create model in `src/models/`
3. Implement service logic in `src/services/`
4. Create controller in `src/controllers/`
5. Define routes in `src/routes/`
6. Add validation in `src/validators/`
7. Update Swagger documentation in `src/config/swagger.ts`

## Testing

```bash
# Run tests (to be implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

ISC

## Author

Prashant Maywad

## Support

For issues and questions, please open an issue on GitHub.

---

## Key Differences: Vouchers vs Promotions

| Feature | Voucher | Promotion |
|---------|---------|-----------|
| **Scope** | Entire order | Specific products/categories |
| **Minimum Order** | Optional | Not available |
| **Product Restrictions** | None | Can restrict by category/ID |
| **Application** | Order subtotal | Eligible items only |

For detailed examples and payload structures, see the `examples/` directory.
