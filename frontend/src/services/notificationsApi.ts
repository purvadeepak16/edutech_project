const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'task_assigned' | 'task_due_soon' | 'task_overdue' | 'task_completed' | 'connection_request' | 'connection_accepted' | 'student_joined';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'task' | 'connection' | 'user';
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('sc_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  const data = await res.json();
  return data.count;
};

export const markAsRead = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to mark as read');
};

export const markAllAsRead = async (): Promise<void> => {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
};

export const deleteNotification = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete notification');
};
