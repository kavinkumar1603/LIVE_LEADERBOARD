import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignedQuestion {
  questionId: mongoose.Types.ObjectId;
  order: number;
  status: 'pending' | 'submitted' | 'evaluated';
}

export interface IStudentAssignment extends Document {
  assessmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  questions: IAssignedQuestion[];
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentAssignmentSchema = new Schema<IStudentAssignment>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        order: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'submitted', 'evaluated'], default: 'pending' }
      }
    ],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

// Compound unique index so one assignment exists per student per assessment
StudentAssignmentSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

export const StudentAssignment = mongoose.model<IStudentAssignment>('StudentAssignment', StudentAssignmentSchema);
