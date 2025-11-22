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
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import voucherRoutes from './routes/voucherRoutes';
import promotionRoutes from './routes/promotionRoutes';
import orderRoutes from './routes/orderRoutes';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

