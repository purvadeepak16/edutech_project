import Notification from '../models/Notification';
import mongoose from 'mongoose';

interface NotificationData {
  userId: string | mongoose.Types.ObjectId;
  type: 'task_assigned' | 'task_due_soon' | 'task_overdue' | 'task_completed' | 'connection_request' | 'connection_accepted' | 'student_joined';
  title: string;
  message: string;
  relatedId?: string | mongoose.Types.ObjectId;
  relatedType?: 'task' | 'connection' | 'user';
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Create a notification with duplicate prevention
 * Checks if similar notification already exists before creating
 */
export const createNotification = async (data: NotificationData): Promise<void> => {
  try {
    const {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority = 'medium'
    } = data;

    // Prevent duplicate notifications for same event
    // Check if unread notification with same type and relatedId exists
    if (relatedId) {
      const existingNotification = await Notification.findOne({
        userId,
        type,
        relatedId,
        isRead: false
      });

      if (existingNotification) {
        // Update existing notification instead of creating duplicate
        existingNotification.message = message;
        existingNotification.title = title;
        existingNotification.createdAt = new Date();
        await existingNotification.save();
        return;
      }
    }

    // Create new notification
    await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority,
      isRead: false
    });

    console.log(`✅ Notification created: ${type} for user ${userId}`);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};

/**
 * Bulk create notifications for multiple users
 */
export const createBulkNotifications = async (
  userIds: (string | mongoose.Types.ObjectId)[],
  notificationData: Omit<NotificationData, 'userId'>
): Promise<void> => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      ...notificationData,
      isRead: false
    }));

    await Notification.insertMany(notifications, { ordered: false });
    console.log(`✅ ${userIds.length} notifications created`);
  } catch (error) {
    console.error('❌ Error creating bulk notifications:', error);
  }
};

/**
 * Delete old read notifications (cleanup utility)
 * Call this periodically to keep database clean
 */
export const cleanupOldNotifications = async (daysOld: number = 30): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      isRead: true,
      createdAt: { $lt: cutoffDate }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
    return 0;
  }
};
