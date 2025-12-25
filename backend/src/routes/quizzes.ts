import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import Quiz from '../models/Quiz';

const router = express.Router();

const validateQuiz = [
  body('title').isString().notEmpty(),
  body('description').optional().isString(),
  body('timeLimitSeconds').optional().isInt({ min: 30, max: 7200 }),
  body('questions').isArray({ min: 1 }),
  body('questions.*.prompt').isString().notEmpty(),
  body('questions.*.options').isArray({ min: 2 }),
  body('questions.*.correctIndex').isInt({ min: 0 }),
  body('questions.*.marks').optional().isFloat({ min: 0 }),
  body('assignedTo').optional().isArray().custom((value) => {
    // Allow empty array or array of valid IDs
    if (Array.isArray(value)) {
      return true;
    }
    throw new Error('assignedTo must be an array');
  }),
];

// Teacher: create quiz
router.post('/', protect, validateQuiz, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const user = (req as any).user;
  if (user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can create quizzes' });

  let { title, description, timeLimitSeconds, questions, assignedTo = [] } = req.body;
  console.log('[Create Quiz] Teacher:', user._id, 'Raw AssignedTo:', assignedTo, 'Type:', typeof assignedTo);
  
  try {
    // Validate questions
    for (const q of questions) {
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        return res.status(400).json({ message: 'correctIndex must be within options length' });
      }
    }

    const normalizedQuestions = questions.map((q: any) => ({
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      marks: q.marks != null ? Number(q.marks) : 1,
    }));

    // Convert assignedTo strings to proper array if needed
    if (!Array.isArray(assignedTo)) {
      assignedTo = [];
    }
    assignedTo = assignedTo.filter((id: any) => id); // Remove empty/null values

    const quiz = await Quiz.create({
      title,
      description,
      timeLimitSeconds: timeLimitSeconds || 300,
      questions: normalizedQuestions,
      assignedTo,
      createdBy: user._id,
    });

    console.log('[Create Quiz] Created quiz ID:', quiz._id, 'AssignedTo after save:', quiz.assignedTo);

    const populated = await Quiz.findById(quiz._id)
      .populate('assignedTo', 'name email')
      .lean();

    console.log('[Create Quiz] Response with populated:', JSON.stringify(populated, null, 2));
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

// Teacher: update quiz
router.put('/:id', protect, [
  body('title').optional().isString().notEmpty(),
  body('description').optional().isString(),
  body('timeLimitSeconds').optional().isInt({ min: 30, max: 7200 }),
  body('questions').optional().isArray({ min: 1 }),
  body('questions.*.prompt').optional().isString().notEmpty(),
  body('questions.*.options').optional().isArray({ min: 2 }),
  body('questions.*.correctIndex').optional().isInt({ min: 0 }),
  body('questions.*.marks').optional().isFloat({ min: 0 }),
  body('assignedTo').optional().isArray(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const user = (req as any).user;
  const { id } = req.params;

  if (user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can edit quizzes' });

  try {
    const quiz: any = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (String(quiz.createdBy) !== String(user._id)) return res.status(403).json({ message: 'Forbidden' });

    const { questions } = req.body;
    if (questions) {
      for (const q of questions) {
        if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
          return res.status(400).json({ message: 'correctIndex must be within options length' });
        }
      }
    }

    if (req.body.questions) {
      req.body.questions = req.body.questions.map((q: any) => ({
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        marks: q.marks != null ? Number(q.marks) : 1,
      }));
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    const populated = await Quiz.findById(id)
      .populate('assignedTo', 'name email')
      .populate('attempts.student', 'name email')
      .lean();
    res.json(populated);
  } catch (err) {
    console.error('Update quiz error:', err);
    res.status(500).json({ message: 'Failed to update quiz' });
  }
});

// Teacher: list own quizzes with attempts
router.get('/', protect, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can view their quizzes' });
  try {
    const quizzes = await Quiz.find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .populate('attempts.student', 'name email')
      .lean();
    res.json({ quizzes });
  } catch (err) {
    console.error('List quizzes error:', err);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Student: list assigned quizzes (MUST be before /:id to avoid route conflict)
router.get('/assigned/list', protect, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'student') return res.status(403).json({ message: 'Only students can view assigned quizzes' });
  try {
    // Convert user._id to string for querying
    const userId = String(user._id);
    console.log('[Student Quizzes] User ID:', userId, 'User Role:', user.role);
    
    const quizzes = await Quiz.find({ assignedTo: user._id })
      .sort({ createdAt: -1 })
      .lean();

    console.log('[Student Quizzes] Found quizzes:', quizzes.length);

    const result = quizzes.map((quiz: any) => {
      const attempt = (quiz.attempts || []).find((a: any) => String(a.student) === String(user._id));
      const totalMarks = (quiz.questions || []).reduce((sum: number, q: any) => sum + (q.marks != null ? q.marks : 1), 0);
      const base = {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimitSeconds: quiz.timeLimitSeconds,
        attempted: Boolean(attempt),
        totalQuestions: quiz.questions.length,
        totalMarks,
        assignedBy: quiz.createdBy,
      } as any;

      if (attempt) {
        base.score = attempt.score;
        base.correctCount = attempt.correctCount;
        base.earnedMarks = attempt.earnedMarks ?? attempt.correctCount; // fallback for legacy attempts
        base.totalMarks = attempt.totalMarks ?? totalMarks;
        base.answers = attempt.answers;
        base.submittedAt = attempt.submittedAt;
        base.correctAnswers = quiz.questions.map((q: any) => q.correctIndex);
        base.questions = quiz.questions.map((q: any) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, marks: q.marks }));
      } else {
        base.questions = quiz.questions.map((q: any) => ({ prompt: q.prompt, options: q.options, marks: q.marks }));
      }

      return base;
    });

    res.json({ quizzes: result });
  } catch (err) {
    console.error('List assigned quizzes error:', err);
    res.status(500).json({ message: 'Failed to fetch assigned quizzes' });
  }
});

// Shared: get quiz detail
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;
  try {
    const quiz: any = await Quiz.findById(id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const isOwner = String(quiz.createdBy) === String(user._id);
    const isAssignedStudent = quiz.assignedTo.some((sid: any) => String(sid) === String(user._id));
    if (!isOwner && !isAssignedStudent) return res.status(403).json({ message: 'Forbidden' });

    const attempt = (quiz.attempts || []).find((a: any) => String(a.student) === String(user._id));

    if (user.role === 'student' && !attempt) {
      quiz.questions = quiz.questions.map((q: any) => ({ prompt: q.prompt, options: q.options, marks: q.marks }));
    }

    res.json(quiz);
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// Student: submit answers
router.post('/:id/submit', protect, body('answers').isArray(), body('timeTakenSec').optional().isInt({ min: 0 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const user = (req as any).user;
  if (user.role !== 'student') return res.status(403).json({ message: 'Only students can submit quizzes' });
  const { id } = req.params;
  const { answers, timeTakenSec = 0 } = req.body;

  try {
    const quiz: any = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const isAssigned = quiz.assignedTo.some((sid: any) => String(sid) === String(user._id));
    if (!isAssigned) return res.status(403).json({ message: 'You are not assigned this quiz' });

    const existingIndex = (quiz.attempts || []).findIndex((a: any) => String(a.student) === String(user._id));
    if (existingIndex !== -1) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Answers length must match questions length' });
    }

    const maxTime = quiz.timeLimitSeconds + 10; // small buffer
    const usedTime = Math.min(timeTakenSec, maxTime);

    let correctCount = 0;
    let earnedMarks = 0;
    let totalMarks = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      const questionMarks = q.marks != null ? q.marks : 1;
      totalMarks += questionMarks;
      if (answers[idx] === q.correctIndex) {
        correctCount += 1;
        earnedMarks += questionMarks;
      }
    });
    const totalQuestions = quiz.questions.length;
    const score = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

    const attempt = {
      student: user._id,
      answers,
      correctCount,
      totalQuestions,
      totalMarks,
      earnedMarks,
      score,
      timeTakenSec: usedTime,
      submittedAt: new Date(),
    };

    quiz.attempts.push(attempt as any);
    await quiz.save();

    res.json({
      quizId: quiz._id,
      score,
      correctCount,
      totalQuestions,
      totalMarks,
      earnedMarks,
      correctAnswers: quiz.questions.map((q: any) => q.correctIndex),
      answers,
      timeTakenSec: usedTime,
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

// Teacher: delete quiz
router.delete('/:id', protect, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  if (user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can delete quizzes' });

  try {
    const quiz: any = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (String(quiz.createdBy) !== String(user._id)) return res.status(403).json({ message: 'Forbidden' });

    await Quiz.findByIdAndDelete(id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ message: 'Failed to delete quiz' });
  }
});

export default router;
