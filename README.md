# Study Connect Hub 🎓

## Overview

**Study Connect Hub** is a comprehensive educational technology platform designed to streamline the learning experience for students while empowering teachers with effective classroom management tools. Built with modern web technologies, the platform combines **task management**, **real-time study tracking**, **gamification**, and **interactive learning tools** to create an engaging and productive educational ecosystem.


## Problem Statement

Students today struggle with:
- **Lack of structured study tracking** - No visibility into study patterns and progress
- **Disconnected learning** - Limited direct communication with teachers
- **Task management scattered** - No unified place to see assignments and deadlines
- **Motivation loss** - No progress indicators or achievement recognition
- **Ineffective study habits** - No tools to build consistent study routines

Teachers face challenges:
- **Time-consuming assignment management** - Manual task distribution and tracking
- **Limited student insights** - Difficulty monitoring individual progress
- **Student accountability** - Hard to track task completion and deadlines
- **Slow feedback loops** - Delayed assessment and notification systems

---

## Solution & Educational Value

**Study Connect Hub** solves these problems by providing:

1. **Real-Time Study Tracking** ⏱️ - Students log study sessions with automatic streak calculations, building consistent study habits
2. **Intelligent Task Management** ✅ - Teachers effortlessly assign tasks to multiple students with deadline tracking and completion monitoring
3. **Teacher-Student Connections** 🤝 - Direct connections via unique codes enable targeted teaching and personalized guidance
4. **Gamified Learning** 🎮 - Study streaks, milestones, and zombie survival game encourage consistent engagement
5. **Performance Analytics** 📊 - Students see progress through study statistics; teachers get completion rates and performance insights
6. **Interactive Learning Tools** 🎨 - Mind maps and peace mode support diverse learning styles
7. **Quiz & Assessment System** 📝 - Teachers create quizzes; students attempt and get instant feedback with score tracking

### Why It Improves Learning

- **Behavioral Change**: Study streaks build daily study habits through positive reinforcement
- **Transparency**: Real-time notifications keep both students and teachers informed
- **Engagement**: Gamification (streaks, zombie game) increases intrinsic motivation
- **Personalization**: Teachers can create targeted assignments for individual students
- **Data-Driven**: Both users get insights into progress patterns to optimize learning

---

## Target Users

- **Students (12-18 years old)**: Want structured study tracking, task management, and motivation
- **Teachers & Educators**: Need classroom management, assignment distribution, and performance monitoring
- **Parents**: Can gain visibility into student progress (future enhancement)

---

## Features

### 🎓 Core Features

**For Students:**
- ✅ Personal & assigned task management with priority levels
- ✅ Real-time study timer (MM:SS format) with session logging
- ✅ Automatic study streak calculation with 7-day milestone notifications
- ✅ Study statistics by date, subject, and time range
- ✅ Connect with teachers using unique teacher codes
- ✅ Receive task assignments with deadline tracking
- ✅ Attempt quizzes with instant scoring and feedback
- ✅ Access study tools (Mind Map, Peace Mode)
- ✅ Play zombie survival game for engagement
- ✅ Real-time notifications dashboard

**For Teachers:**
- ✅ Generate unique teacher code for student connections
- ✅ Create and assign tasks to multiple students
- ✅ Monitor task completion status in real-time
- ✅ Create quizzes with multiple-choice questions
- ✅ View quiz leaderboard and student performance
- ✅ Track assignment completion rates
- ✅ View connected students and their progress
- ✅ Access student profile data
- ✅ Manage pending connection requests
- ✅ Performance analytics dashboard

**For All Users:**
- ✅ Secure authentication with JWT tokens
- ✅ Role-based access control (Student/Teacher)
- ✅ Real-time notification system
- ✅ Responsive design across devices
- ✅ Intuitive UI with Tailwind CSS styling

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (optimized build & dev server)
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: shadcn/ui (custom-built components)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **HTTP Client**: Fetch API
- **Notifications**: React Toaster + Sonner
- **State Management**: React Hooks (useState, useEffect, useContext)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcrypt
- **Input Validation**: express-validator
- **CORS**: cors package
- **Environment**: dotenv

### Database
- **MongoDB**: NoSQL database for flexible schema
- **Mongoose**: ODM for data validation and relationships
- **Collections**: User, StudentProfile, TeacherProfile, Task, StudyLog, StudyStreak, Connection, Notification, Quiz

### Other Tools
- **Package Manager**: npm & bun
- **Version Control**: Git & GitHub
- **Development**: VS Code, Dev Containers
- **DevOps**: Docker-ready environment

---

## Application Flow
### User Roles & Workflows
#### 📚 Student Flow
```
Registration → Login → Dashboard
├─ Connect with teacher (enter code)
├─ View personal + assigned tasks
├─ Start study timer → Log sessions
├─ Track study streaks & statistics
├─ Receive notifications
├─ Attempt quizzes → View scores
└─ Play zombie game
```

#### 👨‍🏫 Teacher Flow
```
Registration → Login → Dashboard
├─ Share unique teacher code
├─ Accept student connections
├─ Create & assign tasks
├─ Monitor task completion
├─ Create quizzes
├─ View student performance
└─ Access analytics
```

### Key User Interactions

1. **Study Session Flow**: Student starts timer → studies → saves session → streak updates automatically
2. **Task Assignment**: Teacher creates task → assigns to students → students get notifications → complete task → teacher sees completion
3. **Teacher Connection**: Student enters teacher code → connection request → teacher accepts → student can receive assignments
4. **Quiz Attempt**: Teacher creates quiz → student answers questions → instant scoring → feedback displayed

---

## Setup & Installation

### Prerequisites

- **Node.js**: v18 or higher - [Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm**: v9 or higher (comes with Node.js)
- **MongoDB**: Local or cloud instance (MongoDB Atlas recommended)
- **Git**: For version control
- **Code Editor**: VS Code or any TypeScript-compatible editor

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/purvadeepak16/edutech_project.git
cd edutech_project

# 2. Install dependencies for both frontend and backend
npm run install:all

# 3. Setup environment variables (see Configuration section below)
# Create backend/.env and frontend/.env files

# 4. Verify installation
npm run check
```

### Running the Application

#### Development Mode (Both Frontend & Backend)

```bash
# Run frontend and backend concurrently
npm run dev

# Frontend will be available at: http://localhost:8080
# Backend API will be available at: http://localhost:5000
```

#### Running Separately

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:8080
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or build separately:
npm run build:frontend  # Creates frontend/dist/
npm run build:backend   # Creates backend/dist/

# Start production backend server
npm run start:backend
# Serves backend on http://localhost:5000
```

---

## Configuration

### Environment Variables

#### Backend Setup (`backend/.env`)

```env
# Database
MONGO_URI=mongodb://localhost:27017/study-connect
# or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/study-connect

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:8080
```

#### Frontend Setup (`frontend/.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# App Settings
VITE_APP_NAME=Study Connect Hub
```

#### Example `.env` Files

Reference files are included:
- `backend/.env.example` - Copy and update with your values
- `frontend/.env.example` - Copy and update with your values

### Database Setup

**Using MongoDB Locally:**

```bash
# Install MongoDB Community Edition: https://docs.mongodb.com/manual/installation/
# Start MongoDB service:
mongod

# The app will auto-create collections on first run
```

**Using MongoDB Atlas (Recommended):**

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get connection string
4. Add to `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/study-connect?retryWrites=true&w=majority
   ```

---

## Data & Persistence

### Data Storage Architecture

**Database**: MongoDB (all persistent data)

**Collections Stored:**

| Collection | Purpose | Key Fields |
|---|---|---|
| **users** | User accounts | id, name, email, password (hashed), role, createdAt |
| **studentprofiles** | Student metadata | userId, connectedTeachers, assignedTasks, createdAt |
| **teacherprofiles** | Teacher metadata | userId, connectedStudents, assignedTasks, code (unique), createdAt |
| **tasks** | Assignments | title, description, assignedBy, assignedTo, status, dueDate, priority, completions |
| **studylogs** | Study sessions | userId, duration, subject, date, startTime, endTime, notes |
| **studystreaks** | Streak tracking | userId, currentStreak, longestStreak, lastStudyDate, totalHours |
| **connections** | Teacher-Student links | teacher, student, status (pending/accepted/rejected), initiatedBy |
| **notifications** | User alerts | userId, type, title, message, read, relatedId, createdAt |
| **quizzes** | Quiz data | title, createdBy, questions[], assignedTo, attempts, createdAt |

### Client-Side Storage

- **localStorage**: JWT token (for session persistence)
- **sessionStorage**: Temporary UI state
- **Memory**: Real-time timer state (client-side only)

### Data Persistence Guarantees

✅ User data persists across sessions (stored in MongoDB)
✅ Study logs and streaks automatically saved
✅ Notifications stored until manually deleted
✅ Task assignments persist across app restarts
✅ Quiz attempts stored with timestamps and scores

---

## Assumptions & Limitations

### Current Assumptions

1. **Single Institution**: Built for one teacher per code (not multi-school)
2. **Modern Browser**: Requires ES6+ compatible browsers
3. **Internet Connection**: Real-time features require active connection
4. **Time Zone**: Uses browser's local time (no timezone conversion)
5. **One Role Per User**: Each user is either student OR teacher (not both)

### Limitations

⚠️ **Prototype Status**: Not production-ready for large-scale deployment
⚠️ **Manual Data Entry**: No auto-sync with school management systems
⚠️ **Single Backend Instance**: Not horizontally scalable yet
⚠️ **No Email Integration**: Notifications are in-app only
⚠️ **No Offline Mode**: Requires internet connectivity
⚠️ **Limited to 20 Items/Page**: Pagination not infinite scroll
⚠️ **No Mobile App**: Web-only (responsive but not native app)
⚠️ **No Parental Controls**: Students can't restrict parent visibility
⚠️ **Basic Analytics**: Limited to completion rates (no advanced ML)
⚠️ **No Backup System**: Data loss if database corrupted

### Known Issues

- Mind Map export not yet implemented
- Peace Mode doesn't persist across page refresh
- Quiz time limit not enforced (soft limit only)

---

## Constraints Compliance ✅

### ❌ No AI/ML/LLMs Used

This project is built entirely on **traditional algorithms and logic**:
- ✅ Streak calculation: Simple date arithmetic
- ✅ Task tracking: CRUD operations
- ✅ Quiz scoring: Basic comparison logic
- ✅ Notifications: Rule-based triggers
- ❌ **NO** machine learning, recommendation engines, or LLMs
- ❌ **NO** ChatGPT, Claude, or other language models
- ❌ **NO** neural networks or predictive models

### ✅ Only Open-Source Libraries

All dependencies are open-source and free:

**Frontend Libraries**:
- React (MIT) - UI framework
- TypeScript (Apache 2.0) - Type safety
- Tailwind CSS (MIT) - Styling
- Vite (MIT) - Build tool
- React Router (MIT) - Routing
- Framer Motion (MIT) - Animations
- shadcn/ui (MIT) - Components

**Backend Libraries**:
- Express.js (MIT) - Web framework
- MongoDB (SSPL) - Database
- Mongoose (MIT) - ODM
- jsonwebtoken (MIT) - Authentication
- bcrypt (MIT) - Password hashing
- express-validator (MIT) - Validation
- cors (MIT) - CORS handling

See [LICENSE](LICENSE) and package.json for full list.

### ✅ Original Work

- 100% custom-built components and features
- No copied code from tutorials (logic reimplemented)
- All UI/UX designed from scratch
- Unique teacher code generation system
- Custom streak calculation algorithm
- Original notification system architecture

### ✅ No Shortcuts or Cheating

- All functionality implemented from first principles
- No code generation tools used
- No templated solutions copied
- Manual testing and debugging
- Original error handling

---

## Future Enhancements

### Phase 2 (Planned Features)

1. **Mobile App**
   - React Native for iOS/Android
   - Offline study session logging
   - Push notifications

2. **Advanced Analytics**
   - Subject-wise performance trends
   - Predictive learning recommendations
   - Parent visibility dashboard

3. **Multi-Class Support**
   - Multiple classes per teacher
   - Class-wide assignments
   - Class discussions/forums

4. **Social Features**
   - Student study groups
   - Peer comparison (opt-in)
   - Achievement badges & leaderboards

5. **Assessment Tools**
   - Assignment rubrics
   - Grade weightage system
   - Report card generation

6. **Integration**
   - Calendar sync (Google Calendar)
   - Email notifications
   - School database integration

7. **Accessibility**
   - Dark mode theme
   - Screen reader support
   - Multi-language support (i18n)

8. **Administration**
   - Admin dashboard
   - User management
   - Usage analytics
   - System health monitoring

---

## Demo & Links

### 📹 Demo Video

- Demo Video: [Coming Soon]

### 🔗 Repository

- **GitHub Repository**: [purvadeepak16/edutech_project](https://github.com/purvadeepak16/edutech_project)
- **Branch**: `main`


### 📖 Documentation

- [STUDY_TRACKER_QUICKSTART.md](STUDY_TRACKER_QUICKSTART.md) - 5-minute quick start guide
- [STUDY_TRACKER_GUIDE.md](STUDY_TRACKER_GUIDE.md) - Comprehensive architecture guide
- [STUDY_TRACKER_IMPLEMENTATION.md](STUDY_TRACKER_IMPLEMENTATION.md) - Implementation details
- [STUDY_TRACKER_ARCHITECTURE.md](STUDY_TRACKER_ARCHITECTURE.md) - System architecture

---

## Project Structure

```
edutech_project/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Express server entry point
│   │   ├── config/
│   │   │   └── db.ts                # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   └── errorHandler.ts      # Error handling
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Task.ts
│   │   │   ├── StudyLog.ts
│   │   │   ├── StudyStreak.ts
│   │   │   ├── Connection.ts
│   │   │   ├── Quiz.ts
│   │   │   └── Notification.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   ├── studylogs.ts
│   │   │   ├── connections.ts
│   │   │   ├── quizzes.ts
│   │   │   └── notifications.ts
│   │   └── utils/                   # Helper functions
│   │       ├── streakHelper.ts
│   │       ├── taskChecker.ts
│   │       └── notificationHelper.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # React entry point
│   │   ├── pages/                   # Page components
│   │   │   ├── Index.tsx            # Landing page
│   │   │   ├── Auth.tsx             # Login/Register
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── StudyLogs.tsx
│   │   │   └── ZombieGame.tsx
│   │   ├── components/              # Reusable components
│   │   │   ├── StudyTimer.tsx
│   │   │   ├── StudyStats.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── MindMap.tsx
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── services/                # API client functions
│   │   │   ├── studyTrackerApi.ts
│   │   │   ├── tasksApi.ts
│   │   │   ├── connectionsApi.ts
│   │   │   └── quizApi.ts
│   │   └── hooks/                   # Custom React hooks
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── .env.example
│
├── package.json                     # Root npm scripts
├── README.md                        # This file
└── STUDY_TRACKER_*.md              # Detailed guides
```

---

## Credits & Acknowledgments

### Open-Source Libraries

This project is built on the shoulders of amazing open-source projects:

- **React** - Facebook/Meta's UI library
- **Express.js** - Fast web framework for Node.js
- **MongoDB & Mongoose** - NoSQL database and ODM
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - JavaScript with types
- **Vite** - Next-generation build tool
- **Framer Motion** - Animation library
- **shadcn/ui** - Beautifully designed components

### Contributors
  - Purva Mhatre
  - Pradnya Patil

### Resources Used

- MongoDB Documentation
- Express.js Best Practices
- React Hooks Guide
- Tailwind CSS Documentation
- TypeScript Handbook

---

## Support & Questions

For questions or issues:

1. **Check Documentation**: Start with [STUDY_TRACKER_QUICKSTART.md](STUDY_TRACKER_QUICKSTART.md)
2. **GitHub Issues**: Open an issue on [GitHub](https://github.com/purvadeepak16/edutech_project/issues)
3. **Documentation**: Refer to detailed guides in `/workspace/`

---
