const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface StudyLog {
  _id: string;
  userId: string;
  subject?: string;
  duration: number; // minutes
  startTime: string;
  endTime: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  totalHours: number;
  totalSessions: number;
  lastStudyDate: string;
  hasStudiedToday: boolean;
}

export interface StudyStats {
  range: string;
  startDate: string;
  endDate: string;
  totalDuration: number; // minutes
  totalHours: number;
  totalSessions: number;
  avgDuration: number; // minutes
  byDate: { [key: string]: { duration: number; sessions: number } };
  bySubject: { [key: string]: { duration: number; sessions: number } };
  logs: StudyLog[];
}

// Start a study session
export const startStudySession = async (subject?: string) => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/studylogs/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ subject })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to start study session');
  }

  return res.json();
};

// Stop study session and save log
export const stopStudySession = async (
  duration: number,
  startTime: Date,
  subject?: string,
  notes?: string
) => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/studylogs/sessions/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      duration,
      startTime: startTime.toISOString(),
      subject,
      notes
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to stop study session');
  }

  return res.json();
};

// Manually log study hours
export const manualLogStudyHours = async (
  duration: number,
  date: Date,
  subject?: string,
  notes?: string
) => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/studylogs/manual-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      duration,
      date: date.toISOString(),
      subject,
      notes
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to log study hours');
  }

  return res.json();
};

// Get study logs
export const getStudyLogs = async (
  page: number = 1,
  limit: number = 20,
  subject?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const token = localStorage.getItem('sc_token');
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (subject) params.append('subject', subject);
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  const res = await fetch(`${API_BASE}/studylogs/logs?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch study logs');
  }

  return res.json();
};

// Get study streak
export const getStudyStreak = async (userId?: string): Promise<StudyStreak> => {
  const token = localStorage.getItem('sc_token');
  const params = userId ? `?userId=${userId}` : '';

  const res = await fetch(`${API_BASE}/studylogs/streak${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch streak');
  }

  return res.json();
};

// Get study statistics
export const getStudyStats = async (range: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StudyStats> => {
  const token = localStorage.getItem('sc_token');
  const url = `${API_BASE}/studylogs/stats?range=${range}`;
  
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Stats API error:', err);
      throw new Error(err.message || 'Failed to fetch statistics');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching stats from', url, ':', error);
    throw error;
  }
};

// Delete study log
export const deleteStudyLog = async (logId: string) => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/studylogs/${logId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete study log');
  }

  return res.json();
};
