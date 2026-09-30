import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { User } from './models/User';

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live_leaderboard_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Create Admin] Connected to MongoDB.');

    const adminEmail = 'kavinkumar.c2024cse@sece.ac.in';
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
        console.log(`Admin ${adminEmail} already exists!`);
        process.exit(0);
    }

    // Default password is the email itself, just like other users in this system
    const adminPasswordHash = await bcrypt.hash(adminEmail, 10);

    const admin = await User.create({
      name: 'Kavin Kumar C',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: 2024
    });

    console.log(`Successfully created admin: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('[Create Admin] Error:', error);
    process.exit(1);
  }
};

createAdmin();
