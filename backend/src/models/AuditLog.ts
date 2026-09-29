import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: 'MARK_AWARDED' | 'MARK_UPDATED' | 'ASSESSMENT_STATUS_CHANGED';
  submissionId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  questionId?: mongoose.Types.ObjectId;
  oldMarks?: number;
  newMarks?: number;
  details?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['MARK_AWARDED', 'MARK_UPDATED', 'ASSESSMENT_STATUS_CHANGED'],
      required: true
    },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' },
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    oldMarks: { type: Number },
    newMarks: { type: Number },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
