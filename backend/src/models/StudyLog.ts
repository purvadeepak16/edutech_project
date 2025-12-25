import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyLog extends Document {
  userId: mongoose.Types.ObjectId;
  subject?: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  notes?: string;
  date: Date; // for easier querying by date
  createdAt: Date;
  updatedAt: Date;
}

const StudyLogSchema = new Schema<IStudyLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String },
  duration: { type: Number, required: true, min: 1 }, // minutes
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  notes: { type: String },
  date: { type: Date, required: true, index: true }, // date without time for grouping
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient querying by userId and date range
StudyLogSchema.index({ userId: 1, date: 1 });
StudyLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IStudyLog>('StudyLog', StudyLogSchema);
