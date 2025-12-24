import StudyLog from '../models/StudyLog';
import StudyStreak from '../models/StudyStreak';
import mongoose from 'mongoose';

/**
 * Get today's date at midnight UTC
 */
export const getTodayDate = (): Date => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

/**
 * Get yesterday's date at midnight UTC
 */
export const getYesterdayDate = (): Date => {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);
  return yesterday;
};

/**
 * Check if user studied today
 */
export const hasStudiedToday = async (userId: mongoose.Types.ObjectId): Promise<boolean> => {
  const today = getTodayDate();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const log = await StudyLog.findOne({
    userId,
    date: { $gte: today, $lt: tomorrow }
  });

  return !!log;
};

/**
 * Calculate and update study streak
 */
export const updateStudyStreak = async (userId: mongoose.Types.ObjectId): Promise<any> => {
  try {
    // Get or create streak record
    let streak = await StudyStreak.findOne({ userId });
    if (!streak) {
      streak = await StudyStreak.create({ userId });
    }

    // Get yesterday's date
    const yesterday = getYesterdayDate();
    const today = getTodayDate();

    // Check if studied today
    const studiedToday = await hasStudiedToday(userId);

    // Check if studied yesterday
    const tomorrowStart = new Date(yesterday);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
    const studiedYesterday = await StudyLog.findOne({
      userId,
      date: { $gte: yesterday, $lt: tomorrowStart }
    });

    // Update streak logic
    if (studiedToday) {
      if (studiedYesterday) {
        // Continuing streak
        streak.currentStreak += 1;
      } else if (!streak.lastStudyDate) {
        // First day
        streak.currentStreak = 1;
      } else {
        // Check if last study was within 24 hours
        const lastStudy = new Date(streak.lastStudyDate);
        const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          streak.currentStreak += 1;
        } else {
          streak.currentStreak = 1;
        }
      }

      streak.lastStudyDate = today;

      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      // No study today - check if streak should reset
      if (streak.lastStudyDate) {
        const lastStudy = new Date(streak.lastStudyDate);
        const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
          streak.currentStreak = 0;
        }
      }
    }

    await streak.save();
    return streak;
  } catch (error) {
    console.error('Error updating study streak:', error);
    throw error;
  }
};

/**
 * Calculate total study hours
 */
export const calculateTotalHours = async (userId: mongoose.Types.ObjectId): Promise<number> => {
  const logs = await StudyLog.find({ userId });
  const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0);
  return Math.round((totalMinutes / 60) * 100) / 100; // round to 2 decimals
};

/**
 * Get study stats for a date range
 */
export const getStudyStats = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) => {
  const logs = await StudyLog.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
  const totalSessions = logs.length;
  const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
  const totalHours = Math.round((totalDuration / 60) * 100) / 100;

  // Group by date
  const byDate: { [key: string]: { duration: number; sessions: number } } = {};
  logs.forEach((log) => {
    const dateKey = log.date.toISOString().split('T')[0];
    if (!byDate[dateKey]) {
      byDate[dateKey] = { duration: 0, sessions: 0 };
    }
    byDate[dateKey].duration += log.duration;
    byDate[dateKey].sessions += 1;
  });

  // Group by subject
  const bySubject: { [key: string]: { duration: number; sessions: number } } = {};
  logs.forEach((log) => {
    const subject = log.subject || 'Unspecified';
    if (!bySubject[subject]) {
      bySubject[subject] = { duration: 0, sessions: 0 };
    }
    bySubject[subject].duration += log.duration;
    bySubject[subject].sessions += 1;
  });

  return {
    totalDuration, // minutes
    totalHours,
    totalSessions,
    avgDuration, // minutes
    byDate,
    bySubject,
    logs
  };
};
