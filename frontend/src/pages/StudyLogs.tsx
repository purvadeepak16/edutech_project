import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Calendar, BookOpen, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getStudyLogs, deleteStudyLog, StudyLog as IStudyLog, manualLogStudyHours } from "@/services/studyTrackerApi";
import { Link } from "react-router-dom";

const StudyLogs = () => {
  const [logs, setLogs] = useState<IStudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Form state for manual entry
  const [manualDuration, setManualDuration] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getSubjectColor = (subject?: string) => {
    // Map subject to one of the site's theme color variables
    const palette = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--pink))',
      'hsl(var(--sidebar-primary))'
    ];

    if (!subject) {
      return { color: 'hsl(var(--muted))', soft: 'hsl(var(--muted) / 0.12)' };
    }

    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % palette.length;
    const base = palette[idx];
    // soft uses alpha in modern CSS: hsl(var(--...) / <alpha>)
    const soft = base.replace('hsl(', 'hsl(').replace(')', ' / 0.12)');
    return { color: base, soft };
  };

  const getSubjectIcon = (subject?: string) => {
    if (!subject) return '📚';
    const s = subject.toLowerCase();
    if (s.includes('math')) return '∑';
    if (s.includes('science') || s.includes('chem') || s.includes('bio')) return '🔬';
    if (s.includes('english') || s.includes('lit')) return '📝';
    if (s.includes('history') || s.includes('soc')) return '🏺';
    if (s.includes('art') || s.includes('design')) return '🎨';
    if (s.includes('music')) return '🎵';
    if (s.includes('program') || s.includes('cs') || s.includes('code')) return '💻';
    return '📚';
  };

  const maxDuration = logs.length ? Math.max(...logs.map((l) => l.duration)) : 0;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await getStudyLogs(page, 20);
      setLogs(result.logs);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load study logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this study log?")) return;

    try {
      await deleteStudyLog(logId);
      toast({ title: "Study log deleted" });
      await fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete study log",
        variant: "destructive"
      });
    }
  };

  const handleManualAdd = async () => {
    if (!manualDuration || !manualDate) {
      toast({
        title: "Missing fields",
        description: "Duration and date are required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await manualLogStudyHours(
        parseInt(manualDuration),
        new Date(manualDate),
        manualSubject,
        manualNotes
      );

      toast({
        title: "Study log added",
        description: `${manualDuration} minutes logged`
      });

      setManualDuration("");
      setManualDate("");
      setManualSubject("");
      setManualNotes("");
      setShowAddDialog(false);
      await fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add log",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-800/50 border-b border-slate-700/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/student" className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-all border border-slate-600/30">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Study Logs</h1>
                <p className="text-sm text-slate-400">Track and manage your study sessions</p>
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Study Log</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-slate-300">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="e.g., 60"
                      value={manualDuration}
                      onChange={(e) => setManualDuration(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-300">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-slate-300">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics"
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-300">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="What did you study?"
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      rows={3}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleManualAdd}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      {isSaving ? "Saving..." : "Add Log"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700/30 rounded-xl h-24 animate-pulse border border-slate-600/20" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-slate-500/50 mx-auto mb-4" />
            <p className="text-slate-400 mb-6 text-lg">No study logs yet</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Log
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log, idx) => {
                const { color, soft } = getSubjectColor(log.subject);
                const icon = getSubjectIcon(log.subject);
                const percent = Math.min(100, Math.round((log.duration / 60) * 100));
                const isPersonalBest = log.duration === maxDuration && maxDuration > 0;
                const isConsistent = log.duration >= 90;

                return (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transform hover:-translate-y-1 transition-all p-5 flex items-center border border-slate-700/50 backdrop-blur-sm group"
                    style={{ borderLeft: `5px solid ${color}` }}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-transform group-hover:scale-110" style={{ background: soft, border: `2px solid ${color}` }}>
                          <span aria-hidden>{icon}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white truncate">{log.subject || 'General'}</h3>
                            <div className="flex items-center gap-2">
                              {isPersonalBest && (
                                <span className="text-xs bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 text-yellow-200 px-2.5 py-1 rounded-full font-semibold border border-yellow-500/30">⭐ Personal Best</span>
                              )}
                              {isConsistent && !isPersonalBest && (
                                <span className="text-xs bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 text-emerald-200 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30">🔥 Consistent</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                            <div className="flex items-center gap-1.5 bg-slate-700/30 px-2.5 py-1 rounded-md">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="font-semibold">{formatTime(log.duration)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-700/30 px-2.5 py-1 rounded-md">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(log.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>

                          {log.notes && (
                            <p className="text-sm text-slate-400 italic mt-2 truncate">{log.notes}</p>
                          )}

                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="ml-auto flex items-center gap-5">
                        <div className="flex flex-col items-center">
                          <div className="relative w-16 h-16 flex items-center justify-center" title={`${percent}% complete`}>
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="hsl(var(--muted) / 0.2)"
                                strokeWidth="6"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={color}
                                strokeWidth="6"
                                strokeDasharray={`${percent * 2.827} 282.7`}
                                className="transition-all duration-500"
                              />
                            </svg>
                            <span className="absolute text-sm font-bold text-white">{percent}%</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(log._id)}
                          className="text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white"
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-400">
                  Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudyLogs;