import mongoose from 'mongoose';
import { Evaluation } from '../models/Evaluation';
import { StudentAssignment } from '../models/StudentAssignment';
import { User } from '../models/User';
import { getIO } from '../config/socket';

export interface LeaderboardEntry {
  rank: number;
  studentId: string; // Mongo ID
  rollNumber: string; // e.g. 24CSE001
  name: string;
  department: string;
  section: string;
  totalMarks: number;
  maxPossibleMarks: number;
  percentage: number;
  completedQuestions: number;
  totalAssignedQuestions: number;
  lastEvaluationTime: Date | null;
}

export class ScoreService {
  /**
   * Calculate live score for a specific student in an assessment
   */
  static async calculateStudentScore(assessmentId: string, studentId: string) {
    const assignment = await StudentAssignment.findOne({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      studentId: new mongoose.Types.ObjectId(studentId)
    }).populate('questions.questionId');

    const evaluations = await Evaluation.find({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      studentId: new mongoose.Types.ObjectId(studentId)
    });

    let totalMarks = 0;
    let maxPossibleMarks = 0;
    let completedCount = 0;
    let lastEvalTime: Date | null = null;

    if (assignment && assignment.questions) {
      assignment.questions.forEach((q: any) => {
        if (q.questionId && typeof q.questionId.marks === 'number') {
          maxPossibleMarks += q.questionId.marks;
        }
      });
    }

    evaluations.forEach((ev) => {
      totalMarks += ev.marksObtained;
      completedCount++;
      if (!lastEvalTime || ev.evaluatedAt > lastEvalTime) {
        lastEvalTime = ev.evaluatedAt;
      }
    });

    const percentage = maxPossibleMarks > 0 ? Math.round((totalMarks / maxPossibleMarks) * 100 * 10) / 10 : 0;

    return {
      totalMarks,
      maxPossibleMarks: maxPossibleMarks || 50,
      percentage,
      completedQuestions: completedCount,
      totalAssignedQuestions: assignment?.questions.length || 0,
      lastEvaluationTime: lastEvalTime
    };
  }

  /**
   * Recalculate full leaderboard for an assessment with tie-breaker logic
   */
  static async getLeaderboard(assessmentId: string): Promise<LeaderboardEntry[]> {
    // Find all student assignments for this assessment
    const assignments = await StudentAssignment.find({
      assessmentId: new mongoose.Types.ObjectId(assessmentId)
    }).populate('studentId', 'name studentId department section email');

    const leaderboardList: LeaderboardEntry[] = [];

    for (const assign of assignments) {
      const student = assign.studentId as any;
      if (!student) continue;

      const scoreData = await this.calculateStudentScore(assessmentId, student._id.toString());

      leaderboardList.push({
        rank: 0,
        studentId: student._id.toString(),
        rollNumber: student.studentId || 'N/A',
        name: student.name,
        department: student.department || 'CSE',
        section: student.section || 'A',
        totalMarks: scoreData.totalMarks,
        maxPossibleMarks: scoreData.maxPossibleMarks,
        percentage: scoreData.percentage,
        completedQuestions: scoreData.completedQuestions,
        totalAssignedQuestions: scoreData.totalAssignedQuestions,
        lastEvaluationTime: scoreData.lastEvaluationTime
      });
    }

    // Sort by:
    // 1. Total Marks DESC
    // 2. Completed Questions DESC
    // 3. Last Evaluation Time ASC (earlier is better)
    leaderboardList.sort((a, b) => {
      if (b.totalMarks !== a.totalMarks) {
        return b.totalMarks - a.totalMarks;
      }
      if (b.completedQuestions !== a.completedQuestions) {
        return b.completedQuestions - a.completedQuestions;
      }
      if (a.lastEvaluationTime && b.lastEvaluationTime) {
        return a.lastEvaluationTime.getTime() - b.lastEvaluationTime.getTime();
      }
      return 0;
    });

    // Assign rank with standard competition ranking
    let currentRank = 1;
    for (let i = 0; i < leaderboardList.length; i++) {
      if (i > 0) {
        const prev = leaderboardList[i - 1];
        const curr = leaderboardList[i];
        if (
          curr.totalMarks === prev.totalMarks &&
          curr.completedQuestions === prev.completedQuestions
        ) {
          curr.rank = prev.rank;
        } else {
          curr.rank = i + 1;
        }
      } else {
        leaderboardList[0].rank = 1;
      }
    }

    return leaderboardList;
  }

  /**
   * Real-time Broadcast via Socket.IO
   */
  static async broadcastUpdates(assessmentId: string, updatedStudentId?: string) {
    try {
      const io = getIO();
      const leaderboard = await this.getLeaderboard(assessmentId);

      // Broadcast updated leaderboard to assessment room
      io.to(`assessment:${assessmentId}`).emit('leaderboard:update', {
        assessmentId,
        leaderboard,
        updatedAt: new Date().toISOString()
      });

      // Also broadcast directly to general listeners
      io.emit('leaderboard:update', {
        assessmentId,
        leaderboard,
        updatedAt: new Date().toISOString()
      });

      // If an individual student was updated, notify them privately
      if (updatedStudentId) {
        const studentScore = await this.calculateStudentScore(assessmentId, updatedStudentId);
        const myRankEntry = leaderboard.find((l) => l.studentId === updatedStudentId);

        io.to(`student:${updatedStudentId}`).emit('student:score_update', {
          assessmentId,
          ...studentScore,
          rank: myRankEntry ? myRankEntry.rank : null,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[ScoreService] Broadcast error:', err);
    }
  }
}
