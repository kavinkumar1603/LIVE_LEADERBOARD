import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { StudentAssignment } from './models/StudentAssignment';

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetAssignments = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live_leaderboard_db';
    await mongoose.connect(mongoUri);

    console.log('Resetting StudentAssignments status to pending...');
    
    // Using updateMany with arrayFilters is not needed if we just update all elements
    // But since it's nested array, we can fetch them, update, and save.
    const assignments = await StudentAssignment.find({});
    let count = 0;
    
    for (const assignment of assignments) {
      let changed = false;
      assignment.questions.forEach((q: any) => {
        if (q.status !== 'pending') {
          q.status = 'pending';
          changed = true;
        }
      });
      if (assignment.completedAt) {
        assignment.completedAt = undefined;
        changed = true;
      }
      
      if (changed) {
        await assignment.save();
        count++;
      }
    }

    console.log(`Reset status for ${count} student assignments.`);
    console.log('Production cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

resetAssignments();
