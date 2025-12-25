# Study Time Tracker Implementation Guide

## Overview
The Study Time Tracker is a comprehensive feature that allows students to:
- ⏱️ Log study sessions with an interactive timer
- 🔥 Track and maintain study streaks
- 📊 View detailed study statistics
- 📚 Categorize studies by subject
- 🎯 Monitor study patterns and progress

---

## Architecture

### Database Models

#### **StudyLog** (`backend/src/models/StudyLog.ts`)
Stores individual study sessions:
```typescript
{
  userId: ObjectId,           // Reference to student
  subject?: string,           // e.g., "Mathematics"
  duration: number,           // in minutes
  startTime: Date,            // Session start
  endTime: Date,              // Session end
  notes?: string,             // Optional notes
  date: Date,                 // For grouping by date (midnight UTC)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1, date: 1 }` - Query logs by user and date
- `{ userId: 1, createdAt: -1 }` - Recent logs for user

#### **StudyStreak** (`backend/src/models/StudyStreak.ts`)
Maintains user streak statistics:
```typescript
{
  userId: ObjectId,           // Reference to student (unique)
  currentStreak: number,      // Consecutive days studied
  longestStreak: number,      // All-time best streak
  lastStudyDate: Date,        // Last session date
  totalHours: number,         // Cumulative hours
  totalSessions: number,      // Total sessions count
  createdAt: Date,
  updatedAt: Date
}
```

---

### Backend Implementation

#### **Utility Functions** (`backend/src/utils/streakHelper.ts`)

**Key Functions:**

1. **`updateStudyStreak(userId)`**
   - Calculates and updates user's streak
   - Logic: 
     - If studied today: increment streak or reset from yesterday's check
     - If gap > 1 day: reset currentStreak to 0
     - Updates longestStreak if current exceeds it
   - Returns updated streak object

2. **`hasStudiedToday(userId)`**
   - Checks if user has study logs for today
   - Used for streak continuation logic

3. **`calculateTotalHours(userId)`**
   - Aggregates all study logs
   - Returns total hours (rounded to 2 decimals)

4. **`getStudyStats(userId, startDate, endDate)`**
   - Groups logs by date and subject
   - Returns:
     - Total duration & sessions
     - Average session duration
     - Daily breakdown
     - Subject breakdown

#### **API Routes** (`backend/src/routes/studylogs.ts`)

**Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/studylogs/sessions/start` | Start timer (returns start time) |
| POST | `/api/studylogs/sessions/stop` | Stop timer & save session |
| POST | `/api/studylogs/manual-log` | Manually log hours |
| GET | `/api/studylogs/logs` | Get paginated study logs |
| GET | `/api/studylogs/streak` | Get current streak info |
| GET | `/api/studylogs/stats` | Get statistics (day/week/month/year) |
| DELETE | `/api/studylogs/:logId` | Delete a study log |

**Request Examples:**

```bash
# Start a session
POST /api/studylogs/sessions/start
{ "subject": "Mathematics" }

# Stop session after 60 minutes
POST /api/studylogs/sessions/stop
{
  "duration": 60,
  "startTime": "2025-01-20T10:00:00Z",
  "subject": "Mathematics",
  "notes": "Chapter 5 practice problems"
}

# Manual entry
POST /api/studylogs/manual-log
{
  "duration": 120,
  "date": "2025-01-20T00:00:00Z",
  "subject": "Physics",
  "notes": "Lab report writing"
}
```

**Milestone Notifications:**
- 🎉 Every 7-day streak milestone triggers a notification
- Triggered automatically on session completion

---

### Frontend Implementation

#### **Service** (`frontend/src/services/studyTrackerApi.ts`)

API wrapper with TypeScript interfaces:
- `startStudySession(subject?)`
- `stopStudySession(duration, startTime, subject?, notes?)`
- `manualLogStudyHours(duration, date, subject?, notes?)`
- `getStudyLogs(page, limit, subject?, startDate?, endDate?)`
- `getStudyStreak(userId?)`
- `getStudyStats(range)` - 'day' | 'week' | 'month' | 'year'
- `deleteStudyLog(logId)`

#### **Components**

**1. StudyTimer** (`frontend/src/components/StudyTimer.tsx`)
- Live countdown timer (updates every second)
- Start/Pause/Reset controls
- Subject and notes input during save
- Displays current streak badge
- Saves session with calculated duration

**Features:**
- Real-time display: HH:MM:SS format
- Pause and resume capability
- Subject field for categorization
- Save dialog with session review
- Loading state during save

**2. StudyStats** (`frontend/src/components/StudyStats.tsx`)
- Dashboard showing key metrics:
  - Current streak (🔥)
  - Longest streak (🏆)
  - Total hours (⏱️)
  - Weekly/Monthly progress
- Tabbed view: Day | Week | Month | Year
- Daily breakdown table
- Subject breakdown table
- Average session duration

**3. StudyLogs** (`frontend/src/pages/StudyLogs.tsx`)
- Full page to view all study logs
- Paginated list (20 items per page)
- Manual log entry dialog
- Delete logs with confirmation
- Filter by subject (UI ready)
- Sort by date descending

#### **Integration in StudentDashboard**

**Location:** Right sidebar in main grid
- StudyTimer widget positioned prominently
- StudyStats section below main content
- "Study Logs" button in Study Tools menu
- Link to `/study-logs` page

---

## User Flow

### Recording a Study Session

```
1. Student clicks "Start" on StudyTimer
   ↓
2. Timer counts up (shown in MM:SS format)
   ↓
3. Student can add optional subject during timing
   ↓
4. Student clicks "Save Session"
   ↓
5. Confirmation dialog shows:
   - Total duration
   - Subject (if added)
   - Notes (optional)
   ↓
6. On confirm:
   - Session saved to StudyLog
   - StudyStreak updated
   - Streak counter incremented/reset as needed
   - If streak milestone (7, 14, 21...), notification sent
   ↓
7. StudyStats refreshed automatically
```

### Manual Entry

```
1. Student clicks "Manual Entry" button in StudyLogs page
   ↓
2. Fills form:
   - Duration (minutes) *required
   - Date *required
   - Subject (optional)
   - Notes (optional)
   ↓
3. Clicks "Add Log"
   ↓
4. Same processing as timer session:
   - Saves StudyLog
   - Updates StudyStreak
   - Triggers notifications
```

### Viewing Statistics

**From StudentDashboard:**
- See current metrics at a glance
- Click tab to change time range
- View daily/subject breakdowns

**From StudyLogs Page:**
- Comprehensive list of all sessions
- Delete old logs
- Manual entry point

---

## Streak Logic

### Consecutive Day Calculation

```
Day 1: Study → Streak = 1
Day 2: Study → Streak = 2 (continues)
Day 2: No study → Streak = 2 (not reset until next day passes)
Day 3: No study → Streak = 0 (more than 1 day gap)
Day 4: Study → Streak = 1 (new streak begins)
```

### Edge Cases

1. **Multiple sessions per day:** Only counts as one day's streak
2. **Timezone:** Uses UTC for date consistency
3. **Manual entries:** Same streak logic applies
4. **Back-dating:** Manual entry on past date updates streak appropriately

---

## Data Relationships

```
User (student)
  ↓
  ├→ StudyLog[] (many sessions)
  │   ├ userId (ref)
  │   ├ duration
  │   └ date (indexed)
  │
  └→ StudyStreak (one record per user)
      ├ userId (unique, ref)
      ├ currentStreak
      ├ longestStreak
      └ totalHours (aggregate)
```

---

## API Response Examples

### Get Streak
```json
{
  "currentStreak": 5,
  "longestStreak": 12,
  "totalHours": 47.5,
  "totalSessions": 42,
  "lastStudyDate": "2025-01-20T00:00:00Z",
  "hasStudiedToday": true
}
```

### Get Stats (Week)
```json
{
  "range": "week",
  "startDate": "2025-01-14T00:00:00Z",
  "endDate": "2025-01-21T23:59:59Z",
  "totalDuration": 420,
  "totalHours": 7,
  "totalSessions": 6,
  "avgDuration": 70,
  "byDate": {
    "2025-01-20": { "duration": 120, "sessions": 2 },
    "2025-01-19": { "duration": 90, "sessions": 1 }
  },
  "bySubject": {
    "Mathematics": { "duration": 180, "sessions": 3 },
    "Physics": { "duration": 240, "sessions": 3 }
  },
  "logs": [...]
}
```

---

## File Structure

### Backend
```
backend/src/
├── models/
│   ├── StudyLog.ts (NEW)
│   └── StudyStreak.ts (NEW)
├── routes/
│   └── studylogs.ts (NEW)
├── utils/
│   └── streakHelper.ts (NEW)
└── index.ts (UPDATED - added route)
```

### Frontend
```
frontend/src/
├── components/
│   ├── StudyTimer.tsx (NEW)
│   └── StudyStats.tsx (NEW)
├── pages/
│   ├── StudyLogs.tsx (NEW)
│   └── StudentDashboard.tsx (UPDATED)
├── services/
│   └── studyTrackerApi.ts (NEW)
└── App.tsx (UPDATED - added route)
```

---

## Future Enhancements

1. **Study Goals:** Set weekly/monthly hour targets
2. **Analytics:** Advanced charts (burndown, heatmaps)
3. **Sharing:** Export stats as PDF/image
4. **Leaderboard:** Class-wide streak rankings
5. **Notifications:** Reminders for inactive students
6. **Mobile App:** Native timer with background tracking
7. **Study Groups:** Collaborative session tracking
8. **AI Insights:** ML-based study recommendations

---

## Testing Scenarios

1. **Session Creation:**
   - ✅ Start timer, pause, resume, save
   - ✅ Add subject before saving
   - ✅ Verify duration calculated correctly

2. **Streak Tracking:**
   - ✅ Study 7 consecutive days → notification
   - ✅ Skip a day → streak resets
   - ✅ Longest streak persists after reset

3. **Statistics:**
   - ✅ Weekly view aggregates logs correctly
   - ✅ Subject breakdown accurate
   - ✅ Average duration calculated
   - ✅ Date range filters work

4. **Manual Entry:**
   - ✅ Log past dates
   - ✅ Edit notes/subject
   - ✅ Delete logs

---

## Notes for Developers

- **Timer Logic:** Client-side timer, submit duration & start time to backend
- **Timezone:** Always use UTC for dates, let frontend handle display timezone
- **Indexing:** `{ userId: 1, date: 1 }` index is critical for performance
- **Notifications:** Integrated with existing notification system
- **Auth:** All endpoints protected with `protect` middleware
- **Validation:** Express-validator used for input validation

---

**Created:** January 24, 2025  
**Version:** 1.0.0  
**Status:** Ready for Integration ✅
