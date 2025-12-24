import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, Notification } from '../services/notificationsApi';
import { useToast } from '../hooks/use-toast';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({ title: 'Success', description: 'All notifications marked as read' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      const deletedNotif = notifications.find(n => n._id === id);
      setNotifications(notifications.filter(n => n._id !== id));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <div className="relative">
        {/* Bell Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <div 
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-96 max-h-[600px] bg-background border border-border/20 rounded-xl shadow-2xl z-[60] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <div>
                <h3 className="text-white font-bold">Notifications</h3>
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-brand-soft hover:text-brand-bright transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/10">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 hover:bg-white/5 transition-colors ${
                        !notif.isRead ? 'bg-brand-soft/5 border-l-2 border-brand-soft' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-lg ${getPriorityColor(notif.priority)}`}>
                              {notif.priority === 'high' ? '🔴' : notif.priority === 'medium' ? '🟡' : '🟢'}
                            </span>
                            <h4 className="text-white font-semibold text-sm truncate">
                              {notif.title}
                            </h4>
                          </div>
                          <p className="text-gray-300 text-xs mb-2">{notif.message}</p>
                          <p className="text-gray-500 text-xs">{getTimeAgo(notif.createdAt)}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notif.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notif._id)}
                              className="p-1 rounded hover:bg-green-500/20 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif._id)}
                            className="p-1 rounded hover:bg-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop - Outside relative container */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/20" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NotificationBell;
