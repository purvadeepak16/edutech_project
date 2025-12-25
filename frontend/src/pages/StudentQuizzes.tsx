import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import quizApi from "@/services/quizApi";
import { Timer } from "lucide-react";

interface AssignedQuiz {
  _id: string;
  title: string;
  description?: string;
  timeLimitSeconds: number;
  questions: { prompt: string; options: string[]; correctIndex?: number }[];
  attempted: boolean;
  score?: number;
  correctAnswers?: number[];
  answers?: number[];
  correctCount?: number;
  totalQuestions: number;
}

const StudentQuizzes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<AssignedQuiz[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizApi.getAssignedQuizzes();
        const list = res.quizzes || [];
        setQuizzes(list);
      } catch (err: any) {
        toast({ title: "Failed to load quizzes", description: err.message || "", variant: "destructive" });
      }
    };
    load();
  }, [toast]);

  // timer
  useEffect(() => {
    if (!activeId || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => (t !== null ? t - 1 : t)), 1000);
    return () => clearInterval(timer);
  }, [activeId, timeLeft]);

  const activeQuiz = useMemo(() => quizzes.find((q) => q._id === activeId), [activeId, quizzes]);

  const startQuiz = (quizId: string) => {
    const quiz = quizzes.find((q) => q._id === quizId);
    if (!quiz) return;
    setActiveId(quizId);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setTimeLeft(quiz.timeLimitSeconds || 300);
  };

  const handleSubmit = async () => {
    if (!activeQuiz || submitting) return;
    setSubmitting(true);
    try {
      const filled = answers.some((a) => a === -1) ? answers.map((a) => (a === -1 ? -1 : a)) : answers;
      const res = await quizApi.submitQuiz(activeQuiz._id, filled as number[], (activeQuiz.timeLimitSeconds || 300) - (timeLeft || 0));
      setQuizzes((prev) => prev.map((q) => (q._id === activeQuiz._id ? { ...q, attempted: true, score: res.score, correctAnswers: res.correctAnswers, answers: res.answers, correctCount: res.correctCount } : q)));
      toast({ title: "Submitted", description: `Score: ${res.score}%` });
    } catch (err: any) {
      toast({ title: "Submit failed", description: err.message || "", variant: "destructive" });
    } finally {
      setSubmitting(false);
      setActiveId(null);
      setTimeLeft(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <Button className="btn-gradient gap-2" onClick={() => navigate(-1)}>
            Back
          </Button>
          <div className="flex items-center gap-2 font-heading font-semibold">
            <Timer className="w-4 h-4" /> Quiz Center
          </div>
          <Button asChild className="btn-gradient gap-2">
            <Link to="/student">Student Home</Link>
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-1">Quizzes for you</h1>
            <p className="text-muted-foreground">Attempt within the timer and submit to see correct answers.</p>
          </div>
          <div className="text-sm text-muted-foreground">{quizzes.filter((q) => q.attempted).length} completed</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{quiz.description || 'MCQ quiz'}</p>
                  <div className="text-xs text-muted-foreground mt-1">{quiz.questions.length} questions · {quiz.timeLimitSeconds}s limit</div>
                </div>
                <Badge variant={quiz.attempted ? "secondary" : "outline"}>{quiz.attempted ? "Submitted" : "Pending"}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {!quiz.attempted && (
                  <Button className="btn-gradient w-full" onClick={() => startQuiz(quiz._id)}>Start Quiz</Button>
                )}
                {quiz.attempted && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Score: {quiz.score}% ({quiz.correctCount}/{quiz.totalQuestions})</div>
                    <div className="space-y-1 text-sm">
                      {quiz.questions.map((q, idx) => {
                        const correctIdx = quiz.correctAnswers ? quiz.correctAnswers[idx] : -1;
                        const studentAnswer = quiz.answers ? quiz.answers[idx] : -1;
                        const isCorrect = correctIdx === studentAnswer;
                        return (
                          <div key={idx} className={`p-2 rounded-lg border ${isCorrect ? 'border-success/60 bg-success/10' : 'border-border/60'}`}>
                            <div className="font-medium">Q{idx + 1}. {q.prompt}</div>
                            <div className="text-muted-foreground">Your answer: {studentAnswer !== -1 ? q.options[studentAnswer] : 'Not answered'}</div>
                            <div className="text-muted-foreground">Correct: {correctIdx !== -1 ? q.options[correctIdx] : '—'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {quizzes.length === 0 && <p className="text-muted-foreground text-sm">No quizzes assigned yet.</p>}
        </div>
      </main>

      <Dialog open={Boolean(activeQuiz)} onOpenChange={(open) => { if (!open) { setActiveId(null); setTimeLeft(null); } }}>
        <DialogContent className="glass-card border-border/50 max-h-[85vh] overflow-y-auto">
          {activeQuiz && (
            <>
              <DialogHeader>
                <DialogTitle>{activeQuiz.title} — Time left: {timeLeft ?? activeQuiz.timeLimitSeconds}s</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-3">
                {activeQuiz.questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border/60">
                    <div className="font-medium mb-2">Q{idx + 1}. {q.prompt}</div>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-2 text-sm">
                          <input type="radio" name={`q-${idx}`} checked={answers[idx] === oi} onChange={() => {
                            const next = [...answers];
                            next[idx] = oi;
                            setAnswers(next);
                          }} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setActiveId(null); setTimeLeft(null); }}>Cancel</Button>
                  <Button className="btn-gradient" onClick={handleSubmit} disabled={submitting}>Submit</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentQuizzes;
