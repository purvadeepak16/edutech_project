import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import connectionRoutes from './routes/connections';
import teacherRoutes from './routes/teachers';
import studentRoutes from './routes/students';
import mindmapRoutes from './routes/mindmaps';
import notificationRoutes from './routes/notifications';
import studylogsRoutes from './routes/studylogs';
import { errorHandler } from './middleware/errorHandler';
import zombieRouter from './routes/zombie';
import quizRoutes from './routes/quizzes';
import { runTaskChecks } from './utils/taskChecker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Study Connect Hub API Server' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/mindmaps', mindmapRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/studylogs', studylogsRoutes);
app.use('/api/zombie', zombieRouter);
app.use('/api/quizzes', quizRoutes);

// Error handler
app.use(errorHandler);

// Connect DB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      
      // 🔔 Run task checks every hour for due soon/overdue notifications
      const ONE_HOUR = 60 * 60 * 1000;
      runTaskChecks(); // Run immediately on startup
      setInterval(runTaskChecks, ONE_HOUR);
      console.log('⏰ Task checker scheduled (runs every hour)');
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

export default app;
