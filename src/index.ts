import dotenv from 'dotenv';
const result = dotenv.config();

if (result.error) {
  console.warn('Warning: Could not load .env file:', result.error.message);
} else {
  console.log('✓ .env file loaded successfully');
}
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database';
import { getSwaggerSpec } from './config/swagger';
import fs from 'fs';
import path from 'path';

// Try to load static swagger.json (for Vercel), fallback to null if not found
let swaggerDocument: any = null;
try {
  // Method 1: Try direct import (most reliable for Vercel)
  try {
    swaggerDocument = require('./swagger.json');
    console.log('✓ Loaded Swagger JSON via require');
  } catch (importError) {
    // Method 2: Try file system paths (fallback)
    const possiblePaths = [
      path.join(__dirname, 'swagger.json'),      // Same dir as compiled code (Vercel)
      path.join(__dirname, '../swagger.json'),   // Parent dir
      path.join(__dirname, './swagger.json'),     // Current dir (alternative)
      path.join(process.cwd(), 'swagger.json'),   // Current working directory
      path.join(process.cwd(), 'dist', 'swagger.json'), // Dist folder
    ];
    
    for (const swaggerPath of possiblePaths) {
      try {
        if (fs.existsSync(swaggerPath)) {
          const fileContent = fs.readFileSync(swaggerPath, 'utf8');
          swaggerDocument = JSON.parse(fileContent);
          console.log('✓ Loaded Swagger JSON from:', swaggerPath);
          break;
        }
      } catch (err) {
        continue;
      }
    }
  }
  
  if (!swaggerDocument) {
    console.log('⚠ Swagger JSON not found, will use dynamic generation');
  }
} catch (error) {
  console.log('⚠ Error loading Swagger JSON, using dynamic generation:', error);
}
import { errorHandler } from './middleware/errorHandler';
import voucherRoutes from './routes/voucherRoutes';
import promotionRoutes from './routes/promotionRoutes';
import orderRoutes from './routes/orderRoutes';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation - use static file for Vercel, dynamic for local dev
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (req: Request, res: Response, next: any) => {
  try {
    // Use static swagger.json if available (for Vercel), otherwise generate dynamically (for local dev)
    const swaggerSpec = swaggerDocument || getSwaggerSpec();
    return swaggerUi.setup(swaggerSpec)(req, res, next);
  } catch (error) {
    console.error('Error setting up Swagger UI:', error);
    return res.status(500).json({ error: 'Failed to load API documentation' });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Discount Service API is running',
    status: 'ok',
    documentation: '/api-docs',
    endpoints: {
      vouchers: '/api/vouchers',
      promotions: '/api/promotions',
      orders: '/api/orders',
    },
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/vouchers', voucherRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/orders', orderRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
  });
});

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
        app.listen(PORT, () => {
      console.log(`Discount Service server is running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

export default app;

