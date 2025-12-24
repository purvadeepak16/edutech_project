import express from 'express';
import Notification from '../models/Notification';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get all notifications for current user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications
    
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user!.id, 
      isRead: false 
    });
    
    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count only
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user!.id, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark specific notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user!.id, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a specific notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all read notifications
router.delete('/read/all', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ 
      userId: req.user!.id, 
      isRead: true 
    });
    
    res.json({ message: 'All read notifications deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
