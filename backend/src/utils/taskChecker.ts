import Task from '../models/Task';
import User from '../models/User';
import { createNotification } from './notificationHelper';

/**
 * Check for tasks due soon (within 24 hours) and create notifications
 */
export const checkTasksDueSoon = async (): Promise<void> => {
  try {
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find tasks that are:
    // 1. Not completed
    // 2. Due within next 24 hours
    // 3. Due date hasn't passed yet
    const tasksDueSoon = await Task.find({
      status: { $ne: 'completed' },
      dueDate: {
        $gte: now,
        $lte: twentyFourHoursLater
      }
    }).populate('assignedTo', 'name');

    for (const task of tasksDueSoon) {
      await createNotification({
        userId: task.assignedTo,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: `"${task.title}" is due in less than 24 hours`,
        relatedId: task._id,
        relatedType: 'task',
        priority: 'high'
      });
    }

    console.log(`✅ Checked ${tasksDueSoon.length} tasks due soon`);
  } catch (error) {
    console.error('❌ Error checking tasks due soon:', error);
  }
};

/**
 * Check for overdue tasks and create notifications
 */
export const checkOverdueTasks = async (): Promise<void> => {
  try {
    const now = new Date();

    // Find tasks that are:
    // 1. Not completed
    // 2. Due date has passed
    const overdueTasks = await Task.find({
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    }).populate('assignedTo assignedBy', 'name');

    for (const task of overdueTasks) {
      // Notify student
      await createNotification({
        userId: task.assignedTo,
        type: 'task_overdue',
        title: 'Task Overdue',
        message: `"${task.title}" is overdue!`,
        relatedId: task._id,
        relatedType: 'task',
        priority: 'high'
      });

      // Also notify teacher if task is assigned by teacher
      if (task.assignedBy) {
        await createNotification({
          userId: task.assignedBy,
          type: 'task_overdue',
          title: 'Student Task Overdue',
          message: `${(task.assignedTo as any).name}'s task "${task.title}" is overdue`,
          relatedId: task._id,
          relatedType: 'task',
          priority: 'medium'
        });
      }
    }

    console.log(`✅ Checked ${overdueTasks.length} overdue tasks`);
  } catch (error) {
    console.error('❌ Error checking overdue tasks:', error);
  }
};

/**
 * Run all background task checks
 * This should be called periodically (e.g., every hour)
 */
export const runTaskChecks = async (): Promise<void> => {
  console.log('🔍 Running background task checks...');
  await checkTasksDueSoon();
  await checkOverdueTasks();
  console.log('✅ Background task checks complete');
};
