import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface IQuizAttempt {
  student: mongoose.Types.ObjectId;
  answers: number[];
  correctCount: number;
  totalQuestions: number;
  score: number;
  timeTakenSec?: number;
  submittedAt: Date;
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  timeLimitSeconds: number;
  questions: IQuizQuestion[];
  assignedTo: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  attempts: IQuizAttempt[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuizQuestion>({
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
});

const AttemptSchema = new Schema<IQuizAttempt>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: Number, required: true }],
  correctCount: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  score: { type: Number, required: true },
  timeTakenSec: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
}, { _id: false });

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String },
  timeLimitSeconds: { type: Number, default: 300 },
  questions: { type: [QuestionSchema], required: true, validate: (v: IQuizQuestion[]) => v.length > 0 },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attempts: { type: [AttemptSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

QuizSchema.index({ createdBy: 1, createdAt: -1 });
QuizSchema.index({ assignedTo: 1 });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
