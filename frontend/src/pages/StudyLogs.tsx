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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/student" className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 z-50 border border-border/20">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Study Logs</h1>
                <p className="text-sm text-gray-600">Track and manage your study sessions</p>
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Study Log</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="e.g., 60"
                      value={manualDuration}
                      onChange={(e) => setManualDuration(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics"
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="What did you study?"
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleManualAdd}
                      disabled={isSaving}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
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
              <div key={i} className="bg-gray-200 rounded-lg h-20 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No study logs yet</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Log
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log, idx) => (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {log.subject && (
                          <div className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            <BookOpen className="w-3 h-3" />
                            {log.subject}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          {formatTime(log.duration)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-600 italic">{log.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(log._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
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
