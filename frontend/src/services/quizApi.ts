const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex?: number;
  marks?: number;
}

export interface QuizPayload {
  title: string;
  description?: string;
  timeLimitSeconds?: number;
  questions: QuizQuestion[];
  assignedTo?: string[];
}

const authHeaders = () => {
  const token = localStorage.getItem('sc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createQuiz = async (payload: QuizPayload) => {
  const res = await fetch(`${API_BASE}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to create quiz');
  return res.json();
};

export const updateQuiz = async (quizId: string, payload: Partial<QuizPayload>) => {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to update quiz');
  return res.json();
};

export const getTeacherQuizzes = async () => {
  const res = await fetch(`${API_BASE}/quizzes`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load quizzes');
  return res.json();
};

export const getAssignedQuizzes = async () => {
  const res = await fetch(`${API_BASE}/quizzes/assigned/list`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load quizzes');
  return res.json();
};

export const getQuiz = async (quizId: string) => {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load quiz');
  return res.json();
};

export const submitQuiz = async (quizId: string, answers: number[], timeTakenSec: number) => {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ answers, timeTakenSec }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to submit quiz');
  return res.json();
};

export const deleteQuiz = async (quizId: string) => {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to delete quiz');
  return res.json();
};

export default { createQuiz, updateQuiz, getTeacherQuizzes, getAssignedQuizzes, getQuiz, submitQuiz, deleteQuiz };
