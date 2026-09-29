import mongoose, { Document, Schema } from 'mongoose';

export interface IEvaluation extends Document {
  assessmentId: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  marksObtained: number;
  maximumMarks: number;
  feedback?: string;
  evaluatedBy: mongoose.Types.ObjectId;
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema = new Schema<IEvaluation>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maximumMarks: { type: Number, required: true },
    feedback: { type: String, default: '' },
    evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evaluatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

EvaluationSchema.index({ assessmentId: 1, studentId: 1, questionId: 1 }, { unique: true });

export const Evaluation = mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);
