import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  description: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  marks: number;
  timeLimitMinutes: number;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  active: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    language: { type: String, default: 'C++ / Python / Java / C' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    category: { type: String, required: true, default: 'General' },
    marks: { type: Number, required: true, default: 10 },
    timeLimitMinutes: { type: Number, default: 15 },
    inputFormat: { type: String },
    outputFormat: { type: String },
    constraints: { type: String },
    sampleInput: { type: String },
    sampleOutput: { type: String },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
