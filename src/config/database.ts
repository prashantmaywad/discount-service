import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Environment check:');
    const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/drivelah';
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

