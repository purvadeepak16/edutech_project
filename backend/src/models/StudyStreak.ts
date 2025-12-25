import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyStreak extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number; // consecutive days
  longestStreak: number;
  lastStudyDate: Date;
  totalHours: number;
  totalSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudyStreakSchema = new Schema<IStudyStreak>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  currentStreak: { type: Number, default: 0, min: 0 },
  longestStreak: { type: Number, default: 0, min: 0 },
  lastStudyDate: { type: Date },
  totalHours: { type: Number, default: 0, min: 0 },
  totalSessions: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IStudyStreak>('StudyStreak', StudyStreakSchema);
