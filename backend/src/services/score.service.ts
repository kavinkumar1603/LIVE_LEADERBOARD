import mongoose from 'mongoose';
import { Evaluation } from '../models/Evaluation';
import { StudentAssignment } from '../models/StudentAssignment';
import { Submission } from '../models/Submission';
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
  lastActivityTime?: Date | null;
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

    const submissions = await Submission.find({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      studentId: new mongoose.Types.ObjectId(studentId)
    });

    const evaluations = await Evaluation.find({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      studentId: new mongoose.Types.ObjectId(studentId)
    });

    let totalMarks = 0;
    let maxPossibleMarks = 0;
    let lastEvalTime: Date | null = null;
    let lastActivityTime: Date | null = null;

    if (assignment && assignment.questions) {
      assignment.questions.forEach((q: any) => {
        if (q.questionId && typeof q.questionId.marks === 'number') {
          maxPossibleMarks += q.questionId.marks;
        }
      });
    }

    evaluations.forEach((ev) => {
      totalMarks += ev.marksObtained;
      if (!lastEvalTime || ev.evaluatedAt > lastEvalTime) {
        lastEvalTime = ev.evaluatedAt;
      }
      if (!lastActivityTime || ev.evaluatedAt > lastActivityTime) {
        lastActivityTime = ev.evaluatedAt;
      }
    });

    submissions.forEach((sub) => {
      if (!lastActivityTime || sub.submittedAt > lastActivityTime) {
        lastActivityTime = sub.submittedAt;
      }
    });

    // Count distinct questions solved/submitted dynamically:
    // A question is counted as solved as soon as it has a submission or is evaluated
    const solvedQuestionIds = new Set<string>();
    submissions.forEach((s) => {
      if (s.questionId) solvedQuestionIds.add(s.questionId.toString());
    });
    evaluations.forEach((e) => {
      if (e.questionId) solvedQuestionIds.add(e.questionId.toString());
    });
    if (assignment && assignment.questions) {
      assignment.questions.forEach((q: any) => {
        if (q.status === 'submitted' || q.status === 'evaluated') {
          const qId = q.questionId?._id ? q.questionId._id.toString() : q.questionId?.toString();
          if (qId) solvedQuestionIds.add(qId);
        }
      });
    }
    const completedCount = solvedQuestionIds.size;

    const percentage = maxPossibleMarks > 0 ? Math.round((totalMarks / maxPossibleMarks) * 100 * 10) / 10 : 0;

    return {
      totalMarks,
      maxPossibleMarks: maxPossibleMarks || 60,
      percentage,
      completedQuestions: completedCount,
      totalAssignedQuestions: assignment?.questions.length || 6,
      lastEvaluationTime: lastEvalTime,
      lastActivityTime: lastActivityTime || lastEvalTime
    };
  }

  /**
   * Recalculate full leaderboard for an assessment with tie-breaker logic
   */
  static async getLeaderboard(assessmentId: string): Promise<LeaderboardEntry[]> {
    // Find all enrolled Section C students in the system
    const students = await User.find({ role: 'student' }).sort({ name: 1 });

    const leaderboardList: LeaderboardEntry[] = [];

    for (const student of students) {
      const scoreData = await this.calculateStudentScore(assessmentId, student._id.toString());

      leaderboardList.push({
        rank: 0,
        studentId: student._id.toString(),
        rollNumber: student.studentId || 'N/A',
        name: student.name,
        department: student.department || 'CSE',
        section: student.section || 'C',
        totalMarks: scoreData.totalMarks,
        maxPossibleMarks: scoreData.maxPossibleMarks || 60,
        percentage: scoreData.percentage,
        completedQuestions: scoreData.completedQuestions,
        totalAssignedQuestions: scoreData.totalAssignedQuestions || 6,
        lastEvaluationTime: scoreData.lastEvaluationTime,
        lastActivityTime: scoreData.lastActivityTime
      });
    }

    // Sort by:
    // 1. Total Marks DESC
    // 2. Completed Questions DESC
    // 3. Last Activity Time ASC (earlier submission/evaluation is better)
    leaderboardList.sort((a, b) => {
      if (b.totalMarks !== a.totalMarks) {
        return b.totalMarks - a.totalMarks;
      }
      if (b.completedQuestions !== a.completedQuestions) {
        return b.completedQuestions - a.completedQuestions;
      }
      const aTime = a.lastActivityTime || a.lastEvaluationTime;
      const bTime = b.lastActivityTime || b.lastEvaluationTime;
      if (aTime && bTime) {
        return aTime.getTime() - bTime.getTime();
      }
      if (aTime) return -1;
      if (bTime) return 1;
      return a.name.localeCompare(b.name);
    });

    // Assign rank with standard competition ranking
    // Any student who has submitted at least one question or received marks gets a competitive rank
    for (let i = 0; i < leaderboardList.length; i++) {
      const curr = leaderboardList[i];
      if (curr.totalMarks <= 0 && curr.completedQuestions <= 0) {
        curr.rank = 0;
        continue;
      }
      if (i > 0) {
        const prev = leaderboardList[i - 1];
        if (
          (prev.totalMarks > 0 || prev.completedQuestions > 0) &&
          curr.totalMarks === prev.totalMarks &&
          curr.completedQuestions === prev.completedQuestions
        ) {
          curr.rank = prev.rank;
        } else {
          curr.rank = i + 1;
        }
      } else {
        curr.rank = 1;
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
      const lbPayload = {
        assessmentId,
        leaderboard,
        updatedAt: new Date().toISOString()
      };

      io.to(`assessment:${assessmentId}`).emit('leaderboard:update', lbPayload);

      // Also broadcast directly to general listeners
      io.emit('leaderboard:update', lbPayload);

      // If an individual student was updated, notify them privately & globally
      if (updatedStudentId) {
        const studentScore = await this.calculateStudentScore(assessmentId, updatedStudentId);
        const myRankEntry = leaderboard.find((l) => l.studentId === updatedStudentId);

        const scorePayload = {
          assessmentId,
          studentId: updatedStudentId,
          ...studentScore,
          rank: myRankEntry ? myRankEntry.rank : null,
          updatedAt: new Date().toISOString()
        };

        io.to(`student:${updatedStudentId}`).emit('student:score_update', scorePayload);
        io.emit('student:score_update', scorePayload);
      }
    } catch (err) {
      console.error('[ScoreService] Broadcast error:', err);
    }
  }
}
