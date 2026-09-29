import mongoose from 'mongoose';
import { Evaluation } from '../models/Evaluation';
import { StudentAssignment } from '../models/StudentAssignment';
import { Submission } from '../models/Submission';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { getIO } from '../config/socket';

// Ensure Question model is registered for populate queries
const _ensureQuestionModel = Question.modelName;

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
    // 1. Fetch all enrolled Section C students in the system
    const students = await User.find({ role: 'student' }).sort({ name: 1 });

    // 2. Batch fetch assignments, submissions, and evaluations in 3 parallel queries
    const [assignments, submissions, evaluations] = await Promise.all([
      StudentAssignment.find({ assessmentId: new mongoose.Types.ObjectId(assessmentId) }).populate('questions.questionId'),
      Submission.find({ assessmentId: new mongoose.Types.ObjectId(assessmentId) }),
      Evaluation.find({ assessmentId: new mongoose.Types.ObjectId(assessmentId) })
    ]);

    // Map by studentId for O(1) in-memory lookups
    const assignmentMap = new Map<string, any>();
    assignments.forEach((a) => assignmentMap.set(a.studentId.toString(), a));

    const submissionsMap = new Map<string, any[]>();
    submissions.forEach((s) => {
      const sId = s.studentId.toString();
      if (!submissionsMap.has(sId)) submissionsMap.set(sId, []);
      submissionsMap.get(sId)!.push(s);
    });

    const evaluationsMap = new Map<string, any[]>();
    evaluations.forEach((e) => {
      const sId = e.studentId.toString();
      if (!evaluationsMap.has(sId)) evaluationsMap.set(sId, []);
      evaluationsMap.get(sId)!.push(e);
    });

    const leaderboardList: LeaderboardEntry[] = [];

    for (const student of students) {
      const studentIdStr = student._id.toString();
      const assignment = assignmentMap.get(studentIdStr);
      const studentSubmissions = submissionsMap.get(studentIdStr) || [];
      const studentEvaluations = evaluationsMap.get(studentIdStr) || [];

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

      studentEvaluations.forEach((ev: any) => {
        totalMarks += ev.marksObtained;
        if (!lastEvalTime || ev.evaluatedAt > lastEvalTime) {
          lastEvalTime = ev.evaluatedAt;
        }
        if (!lastActivityTime || ev.evaluatedAt > lastActivityTime) {
          lastActivityTime = ev.evaluatedAt;
        }
      });

      studentSubmissions.forEach((sub: any) => {
        if (!lastActivityTime || sub.submittedAt > lastActivityTime) {
          lastActivityTime = sub.submittedAt;
        }
      });

      // Count distinct questions solved/submitted
      const solvedQuestionIds = new Set<string>();
      studentSubmissions.forEach((s: any) => {
        if (s.questionId) solvedQuestionIds.add(s.questionId.toString());
      });
      studentEvaluations.forEach((e: any) => {
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

      leaderboardList.push({
        rank: 0,
        studentId: studentIdStr,
        rollNumber: student.studentId || 'N/A',
        name: student.name,
        department: student.department || 'CSE',
        section: student.section || 'C',
        totalMarks,
        maxPossibleMarks: maxPossibleMarks || 60,
        percentage,
        completedQuestions: completedCount,
        totalAssignedQuestions: assignment?.questions.length || 6,
        lastEvaluationTime: lastEvalTime,
        lastActivityTime: lastActivityTime || lastEvalTime
      });
    }

    // Sort by:
    // 1. Total Marks DESC
    // 2. Completed Questions DESC
    // 3. Last Activity Time ASC (earlier submission/evaluation is better)
    // 4. Name ASC
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
