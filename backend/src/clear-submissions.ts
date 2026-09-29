import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Submission } from './models/Submission';
import { Evaluation } from './models/Evaluation';
import { AuditLog } from './models/AuditLog';

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live_leaderboard_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Clearing submissions, evaluations, and audit logs...');

    const subRes = await Submission.deleteMany({});
    console.log(`Deleted ${subRes.deletedCount} submissions.`);

    const evalRes = await Evaluation.deleteMany({});
    console.log(`Deleted ${evalRes.deletedCount} evaluations.`);

    const auditRes = await AuditLog.deleteMany({});
    console.log(`Deleted ${auditRes.deletedCount} audit logs.`);

    console.log('Production cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearData();
