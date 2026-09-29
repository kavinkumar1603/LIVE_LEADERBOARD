import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live_leaderboard_db';
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB connected successfully to ${mongoUri}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    process.exit(1);
  }
};
