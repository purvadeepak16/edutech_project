import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import StudyLog from '../models/StudyLog';
import StudyStreak from '../models/StudyStreak';
import {
  updateStudyStreak,
  calculateTotalHours,
  getStudyStats,
  hasStudiedToday,
  getTodayDate
} from '../utils/streakHelper';
import { createNotification } from '../utils/notificationHelper';

const router = express.Router();

// Start a study session
router.post(
  '/sessions/start',
  protect,
  body('subject').optional().isString(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = (req as any).user;
      const { subject } = req.body;

      // Return start time - client will handle timer
      const sessionData = {
        userId: user._id,
        subject,
        startTime: new Date()
      };

      res.json({
        message: 'Study session started',
        session: sessionData
      });
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({ message: 'Failed to start session' });
    }
  }
);

// Stop session and save study log
router.post(
  '/sessions/stop',
  protect,
  body('duration').isInt({ min: 1 }),
  body('subject').optional().isString(),
  body('notes').optional().isString(),
  body('startTime').isISO8601(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = (req as any).user;
      const { duration, subject, notes, startTime } = req.body;

      const startTimeDate = new Date(startTime);
      const endTime = new Date();
      const today = getTodayDate();

      const studyLog = await StudyLog.create({
        userId: user._id,
        subject,
        duration, // in minutes
        startTime: startTimeDate,
        endTime,
        notes,
        date: today
      });

      // Update streak
      const streak = await updateStudyStreak(user._id);

      // Update streak document with total stats
      const totalHours = await calculateTotalHours(user._id);
      const sessions = await StudyLog.countDocuments({ userId: user._id });
      await StudyStreak.updateOne(
        { userId: user._id },
        { totalHours, totalSessions: sessions }
      );

      // 🎉 Notification for milestones
      if (streak.currentStreak % 7 === 0 && streak.currentStreak > 0) {
        await createNotification({
          userId: user._id,
          type: 'achievement',
          title: `🔥 ${streak.currentStreak}-Day Streak!`,
          message: `Amazing! You've maintained a ${streak.currentStreak}-day study streak!`,
          priority: 'high'
        });
      }

      res.json({
        message: 'Study session saved',
        studyLog,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastStudyDate: streak.lastStudyDate
        }
      });
    } catch (error) {
      console.error('Error stopping session:', error);
      res.status(500).json({ message: 'Failed to save session' });
    }
  }
);

// Manually log study hours
router.post(
  '/manual-log',
  protect,
  body('duration').isInt({ min: 1 }),
  body('date').isISO8601(),
  body('subject').optional().isString(),
  body('notes').optional().isString(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = (req as any).user;
      const { duration, date, subject, notes } = req.body;

      const logDate = new Date(date);
      logDate.setUTCHours(0, 0, 0, 0);

      const startTime = new Date(logDate);
      const endTime = new Date(logDate);
      endTime.setUTCHours(endTime.getUTCHours() + Math.floor(duration / 60));
      endTime.setUTCMinutes(endTime.getUTCMinutes() + (duration % 60));

      const studyLog = await StudyLog.create({
        userId: user._id,
        subject,
        duration,
        startTime,
        endTime,
        notes,
        date: logDate
      });

      // Update streak
      await updateStudyStreak(user._id);
      const totalHours = await calculateTotalHours(user._id);
      const sessions = await StudyLog.countDocuments({ userId: user._id });
      await StudyStreak.updateOne(
        { userId: user._id },
        { totalHours, totalSessions: sessions }
      );

      res.json({
        message: 'Study hours logged',
        studyLog
      });
    } catch (error) {
      console.error('Error logging study hours:', error);
      res.status(500).json({ message: 'Failed to log study hours' });
    }
  }
);

// Get study logs with pagination
router.get('/logs', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 20, subject, startDate, endDate } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    let query: any = { userId: user._id };

    if (subject) {
      query.subject = subject;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const logs = await StudyLog.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await StudyLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching study logs:', error);
    res.status(500).json({ message: 'Failed to fetch study logs' });
  }
});

// Get study streak info
router.get('/streak', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const targetUserId = (req.query.userId as string) || user._id;

    // Check if requesting user is teacher or requesting own data
    if (user.role === 'student' && user._id.toString() !== targetUserId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let streak = await StudyStreak.findOne({ userId: targetUserId });
    if (!streak) {
      streak = await StudyStreak.create({ userId: targetUserId });
    }

    const hasStudiedToday = await StudyLog.findOne({
      userId: targetUserId,
      date: { $gte: getTodayDate() }
    });

    res.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalHours: streak.totalHours,
      totalSessions: streak.totalSessions,
      lastStudyDate: streak.lastStudyDate,
      hasStudiedToday: !!hasStudiedToday
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ message: 'Failed to fetch streak' });
  }
});

// Get study statistics
router.get('/stats', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { range = 'week' } = req.query; // week, month, year

    let startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case 'day':
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setUTCDate(startDate.getUTCDate() - 7);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setUTCMonth(startDate.getUTCMonth() - 1);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      default:
        startDate.setUTCDate(startDate.getUTCDate() - 7);
        startDate.setUTCHours(0, 0, 0, 0);
    }

    endDate.setUTCHours(23, 59, 59, 999);

    const stats = await getStudyStats(user._id, startDate, endDate);

    res.json({
      range,
      startDate,
      endDate,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Delete a study log
router.delete('/:logId', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { logId } = req.params;

    const studyLog = await StudyLog.findById(logId);
    if (!studyLog) {
      return res.status(404).json({ message: 'Study log not found' });
    }

    if (studyLog.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await StudyLog.deleteOne({ _id: logId });

    res.json({ message: 'Study log deleted' });
  } catch (error) {
    console.error('Error deleting study log:', error);
    res.status(500).json({ message: 'Failed to delete study log' });
  }
});

export default router;
