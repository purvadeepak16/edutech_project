import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Plus, Clock, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { stopStudySession } from "@/services/studyTrackerApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudyTimerProps {
  onSessionComplete?: (data: any) => void;
  currentStreak?: number;
}

const StudyTimer = ({ onSessionComplete, currentStreak }: StudyTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
    setSubject("");
    setNotes("");
  };

  const handleStop = async () => {
    if (seconds === 0) {
      toast({
        title: "No study time",
        description: "Please study for at least a minute",
        variant: "destructive"
      });
      return;
    }

    setShowDialog(true);
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const duration = Math.ceil(seconds / 60); // convert to minutes
      const startTime = new Date(Date.now() - seconds * 1000);

      const result = await stopStudySession(duration, startTime, subject, notes);

      toast({
        title: "Study session saved!",
        description: `${formatTime(seconds)} logged successfully`,
      });

      handleReset();
      setShowDialog(false);
      onSessionComplete?.(result);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save session",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white"
    >
      {/* Streak Badge */}
      {currentStreak && currentStreak > 0 && (
        <div className="absolute top-4 right-4 bg-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold">
          🔥 {currentStreak}-Day Streak
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Study Timer
        </h2>

        {/* Timer Display */}
        <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-6 text-center">
          <div className="text-5xl font-mono font-bold tracking-widest">
            {formatTime(seconds)}
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            {isRunning ? "Timer running..." : "Ready to study?"}
          </p>
        </div>

        {/* Subject Display */}
        {subject && (
          <div className="bg-white bg-opacity-10 rounded-lg p-3 flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4" />
            <span>{subject}</span>
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            className="px-4 text-white border-white hover:bg-white hover:bg-opacity-20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Save Session */}
        {seconds > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleStop}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Save Study Session</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Duration Display */}
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatTime(seconds)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ({Math.ceil(seconds / 60)} minutes)
                      </p>
                    </div>

                    {/* Subject Input */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject (Optional)</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics, English, Physics"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>

                    {/* Notes Input */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="What did you study? How did you feel?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveSession}
                        disabled={isSaving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSaving ? "Saving..." : "Save Session"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default StudyTimer;
