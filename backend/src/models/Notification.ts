import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'task_assigned' | 'task_due_soon' | 'task_overdue' | 'task_completed' | 'connection_request' | 'connection_accepted' | 'student_joined';
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedType?: 'task' | 'connection' | 'user';
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

const NotificationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['task_assigned', 'task_due_soon', 'task_overdue', 'task_completed', 'connection_request', 'connection_accepted', 'student_joined'],
    index: true
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedId: { 
    type: Schema.Types.ObjectId,
    index: true
  },
  relatedType: { 
    type: String,
    enum: ['task', 'connection', 'user']
  },
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate notifications for same event
NotificationSchema.index({ userId: 1, type: 1, relatedId: 1 }, { unique: false });

export default mongoose.model<INotification>('Notification', NotificationSchema);
