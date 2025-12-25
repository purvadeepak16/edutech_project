import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getAcceptedConnections, type Student as StudentType } from "@/services/connectionsApi";
import quizApi, { type QuizQuestion } from "@/services/quizApi";
import { GraduationCap, ArrowLeft, Plus, Save, Users, ListChecks, CheckCircle2, Trash2 } from "lucide-react";

interface QuizFormState {
  title: string;
  description: string;
  timeLimitSeconds: number;
  questions: QuizQuestion[];
  assignedTo: string[];
}

const createEmptyQuestion = (): QuizQuestion => ({ prompt: "Untitled question", options: ["Option A", "Option B"], correctIndex: 0, marks: 1 });

const TeacherQuizzes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState<QuizFormState>({
    title: "Quick Check",
    description: "",
    timeLimitSeconds: 300,
    questions: [createEmptyQuestion()],
    assignedTo: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [accepted, teacherQuizzes] = await Promise.all([
          getAcceptedConnections(),
          quizApi.getTeacherQuizzes(),
        ]);
        setStudents(accepted || []);
        setQuizzes(teacherQuizzes.quizzes || []);
      } catch (err: any) {
        toast({ title: "Failed to load quizzes", description: err.message || "Unexpected error", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "Quick Check", description: "", timeLimitSeconds: 300, questions: [createEmptyQuestion()], assignedTo: [] });
  };

  const handleSave = async () => {
    if (!form.title.trim() || form.questions.length === 0) {
      toast({ title: "Missing info", description: "Add a title and at least one question.", variant: "destructive" });
      return;
    }
    if (form.questions.some((q) => q.options.length < 2)) {
      toast({ title: "Add options", description: "Each question needs at least two options.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, questions: form.questions.map((q) => ({ ...q, marks: q.marks != null ? Number(q.marks) : 1, options: q.options.map((o) => o || "(blank)") })) };
      console.log('[Save Quiz] Payload:', JSON.stringify(payload, null, 2));
      console.log('[Save Quiz] AssignedTo count:', payload.assignedTo.length);
      
      if (editingId) {
        const updated = await quizApi.updateQuiz(editingId, payload);
        setQuizzes((prev) => prev.map((q) => (q._id === editingId ? updated : q)));
        toast({ title: "Quiz updated", description: "Changes saved." });
      } else {
        const created = await quizApi.createQuiz(payload);
        console.log('[Save Quiz] Response:', created);
        setQuizzes((prev) => [created, ...prev]);
        toast({ title: "Quiz created", description: "Assigned students can now attempt it." });
      }
      resetForm();
    } catch (err: any) {
      console.error('[Save Quiz] Error:', err);
      toast({ title: "Save failed", description: err.message || "Unable to save quiz", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (quiz: any) => {
    setEditingId(quiz._id);
    setForm({
      title: quiz.title,
      description: quiz.description || "",
      timeLimitSeconds: quiz.timeLimitSeconds || 300,
      questions: (quiz.questions || [createEmptyQuestion()]).map((q: any) => ({ ...q, marks: q.marks != null ? q.marks : 1 })),
      assignedTo: (quiz.assignedTo || []).map((s: any) => String(s._id || s)),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const attemptsSummary = useMemo(() => {
    return quizzes.reduce((acc, quiz) => acc + (quiz.attempts ? quiz.attempts.length : 0), 0);
  }, [quizzes]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <Button className="btn-gradient" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /><span className="ml-2">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-heading font-semibold">Quiz Builder</span>
          </div>
          <Button asChild className="btn-gradient">
            <Link to="/teacher"><GraduationCap className="w-4 h-4" /><span className="ml-2">Teacher Home</span></Link>
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-1">Create & Track Quizzes</h1>
            <p className="text-muted-foreground">Build quick MCQs, assign to students, and review scores instantly.</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-sm text-muted-foreground">
              <div className="font-semibold text-foreground">{quizzes.length} quizzes</div>
              <div>{attemptsSummary} attempts recorded</div>
            </div>
            <Button className="btn-gradient" onClick={resetForm}><Plus className="w-4 h-4" /><span className="ml-2">New Quiz</span></Button>
            <Button className="btn-gradient" onClick={handleSave} disabled={saving}>
              {saving ? <Save className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span className="ml-2">Save</span>
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks className="w-4 h-4" /> Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Quiz title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="flex gap-3 items-center">
                <Input type="number" min={30} max={7200} value={form.timeLimitSeconds}
                  onChange={(e) => setForm({ ...form, timeLimitSeconds: Number(e.target.value) || 0 })} />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-medium">Assign to students</div>
                <Badge variant="outline">{form.assignedTo.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {students.map((s) => {
                  const studentObj = (s as any).student || s;
                  const id = String(studentObj._id || (s as any)._id || s.id);
                  const studentName = studentObj.name || (s as any).name || 'Student';
                  const selected = form.assignedTo.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        console.log('[Assign] Toggling student:', id, 'Current assignedTo:', form.assignedTo);
                        setForm((prev) => ({ 
                          ...prev, 
                          assignedTo: selected ? prev.assignedTo.filter((x) => x !== id) : [...prev.assignedTo, id] 
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm ${selected ? 'bg-primary/10 border-primary text-primary' : 'border-border text-foreground hover:border-primary/50'}`}
                    >
                      <Users className="w-4 h-4 inline mr-1" /> {studentName}
                    </button>
                  );
                })}
                {students.length === 0 && <p className="text-sm text-muted-foreground">No connected students yet.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.questions.map((q, qi) => (
                <div key={qi} className="p-3 border border-border/60 rounded-xl space-y-3">
                  <Input value={q.prompt} onChange={(e) => {
                    const next = [...form.questions];
                    next[qi] = { ...next[qi], prompt: e.target.value };
                    setForm({ ...form, questions: next });
                  }} />
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-foreground">Marks:</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      className="w-28"
                      value={q.marks ?? 1}
                      onChange={(e) => {
                        const next = [...form.questions];
                        next[qi] = { ...next[qi], marks: Number(e.target.value) };
                        setForm({ ...form, questions: next });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi}
                          onChange={() => {
                            const next = [...form.questions];
                            next[qi] = { ...next[qi], correctIndex: oi };
                            setForm({ ...form, questions: next });
                          }} />
                        <Input value={opt} onChange={(e) => {
                          const next = [...form.questions];
                          const opts = [...next[qi].options];
                          opts[oi] = e.target.value;
                          next[qi] = { ...next[qi], options: opts };
                          setForm({ ...form, questions: next });
                        }} />
                        {q.options.length > 2 && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            const next = [...form.questions];
                            const opts = [...next[qi].options];
                            opts.splice(oi, 1);
                            next[qi] = { ...next[qi], options: opts, correctIndex: Math.min(next[qi].correctIndex || 0, opts.length - 1) };
                            setForm({ ...form, questions: next });
                          }}>×</Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => {
                      const next = [...form.questions];
                      next[qi] = { ...next[qi], options: [...next[qi].options, `Option ${String.fromCharCode(65 + next[qi].options.length)}`] };
                      setForm({ ...form, questions: next });
                    }}>
                      <Plus className="w-4 h-4 mr-1" /> Add option
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="secondary" onClick={() => setForm({ ...form, questions: [...form.questions, createEmptyQuestion()] })}>
                <Plus className="w-4 h-4 mr-2" /> Add question
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="quizzes" className="mt-8">
          <TabsList>
            <TabsTrigger value="quizzes">My Quizzes</TabsTrigger>
            <TabsTrigger value="attempts">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="quizzes" className="space-y-3 mt-4">
            {loading && <p className="text-muted-foreground text-sm">Loading...</p>}
            {!loading && quizzes.length === 0 && <p className="text-muted-foreground text-sm">No quizzes yet.</p>}
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="glass-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{quiz.description || 'No description'}</p>
                    <div className="text-xs text-muted-foreground mt-1">{quiz.questions?.length || 0} questions · {quiz.timeLimitSeconds}s limit · {(quiz.questions || []).reduce((sum: number, q: any) => sum + (q.marks ?? 1), 0)} marks</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(quiz)}>Edit</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setShowPreview(true); setForm({ ...form }); }}>Preview</Button>
                    <Button variant="destructive" size="sm" className="glow-pink transition-transform hover:scale-105" onClick={() => { setDeleteTargetId(quiz._id); setShowDeleteConfirm(true); }}>
                      <Trash2 className="w-4 h-4" /><span className="ml-1">Delete</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(quiz.assignedTo || []).map((s: any) => {
                      const studentId = String(s._id || s);
                      const studentName = s.name || students.find(st => String((st as any).student?._id || (st as any)._id) === studentId)?.student?.name || students.find(st => String((st as any).student?._id || (st as any)._id) === studentId)?.name || 'Student';
                      return <Badge key={studentId} variant="secondary">{studentName}</Badge>;
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">Attempts: {quiz.attempts ? quiz.attempts.length : 0}</div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="attempts" className="space-y-3 mt-4">
            {quizzes.flatMap((quiz) => quiz.attempts?.map((att: any) => ({ quizTitle: quiz.title, ...att })) || []).length === 0 && (
              <p className="text-muted-foreground text-sm">No submissions yet.</p>
            )}
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(quiz.attempts || []).map((att: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap gap-3 items-center justify-between text-sm">
                      <div className="font-medium">{att.student?.name || 'Student'}</div>
                      <div className="text-muted-foreground">Score: {att.score}% ({att.earnedMarks ?? att.correctCount}/{att.totalMarks ?? att.totalQuestions} marks)</div>
                      <div className="text-muted-foreground">Time: {att.timeTakenSec || 0}s</div>
                      <Badge variant="secondary">Submitted {new Date(att.submittedAt).toLocaleString()}</Badge>
                    </div>
                  ))}
                  {(quiz.attempts || []).length === 0 && <p className="text-muted-foreground text-sm">No attempts yet.</p>}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="glass-card border-border/50 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {form.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            {form.questions.map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border/60">
                <div className="font-medium mb-1">Q{idx + 1}. {q.prompt}</div>
                <div className="text-xs text-muted-foreground mb-2">Marks: {q.marks ?? 1}</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={q.correctIndex === oi ? 'text-primary font-semibold' : ''}>• {opt}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="glass-card border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-destructive" /> Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the quiz. This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button
              variant="destructive"
              className="glow-pink transition-transform hover:scale-105"
              onClick={async () => {
                if (!deleteTargetId) return;
                try {
                  const deleted = await quizApi.deleteQuiz(deleteTargetId);
                  setQuizzes((prev) => prev.filter((q) => q._id !== deleteTargetId));
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                  toast({ title: "Quiz deleted", description: deleted.message || "The quiz has been removed." });
                } catch (err: any) {
                  toast({ title: "Delete failed", description: err.message || "Unable to delete quiz", variant: "destructive" });
                }
              }}
            >
              <Trash2 className="w-4 h-4" /><span className="ml-2">Delete</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherQuizzes;
