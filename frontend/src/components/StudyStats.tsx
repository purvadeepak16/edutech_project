import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Calendar,
  Flame,
  Target,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getStudyStreak, getStudyStats, StudyStreak, StudyStats } from "@/services/studyTrackerApi";

interface StudyStatsProps {
  refreshTrigger?: number;
}

const StudyStatsCard = ({ icon: Icon, title, value, subtext, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${color} rounded-lg shadow-md p-4 text-white`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-opacity-90">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtext && <p className="text-xs text-opacity-75 mt-1">{subtext}</p>}
      </div>
      <Icon className="w-8 h-8 text-opacity-50" />
    </div>
  </motion.div>
);

const StudyStats = ({ refreshTrigger }: StudyStatsProps) => {
  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [range, setRange] = useState<"day" | "week" | "month" | "year">("week");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [range, refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [streakData, statsData] = await Promise.all([
        getStudyStreak(),
        getStudyStats(range)
      ]);
      setStreak(streakData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching study stats:', error);
      // Set default values instead of showing error
      setStreak({
        currentStreak: 0,
        longestStreak: 0,
        totalHours: 0,
        totalSessions: 0,
        lastStudyDate: null,
        hasStudiedToday: false
      } as StudyStreak);
      setStats({
        range,
        startDate: new Date(),
        endDate: new Date(),
        totalDuration: 0,
        totalHours: 0,
        totalSessions: 0,
        avgDuration: 0,
        byDate: {},
        bySubject: {},
        logs: []
      } as StudyStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !streak || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  // Return default view with zeros if no data
  if (!streak || !stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Start studying to see your statistics!</p>
      </div>
    );
  }

  const dailyData = Object.entries(stats.byDate).map(([date, data]) => ({
    date,
    hours: Math.round((data.duration / 60) * 100) / 100,
    sessions: data.sessions
  }));

  const subjectData = Object.entries(stats.bySubject).map(([subject, data]) => ({
    subject,
    hours: Math.round((data.duration / 60) * 100) / 100,
    sessions: data.sessions
  }));

  const getRangeLabel = () => {
    switch (range) {
      case "day": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      default: return "This Week";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StudyStatsCard
          icon={Flame}
          title="Current Streak"
          value={`${streak.currentStreak}d`}
          subtext={streak.hasStudiedToday ? "Studied today ✓" : "Study today to continue"}
          color="bg-gradient-to-br from-orange-500 to-red-600"
        />
        <StudyStatsCard
          icon={Award}
          title="Longest Streak"
          value={`${streak.longestStreak}d`}
          subtext="Best achievement"
          color="bg-gradient-to-br from-amber-500 to-yellow-600"
        />
        <StudyStatsCard
          icon={Clock}
          title="Total Hours"
          value={streak.totalHours}
          subtext={`${streak.totalSessions} sessions`}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StudyStatsCard
          icon={TrendingUp}
          title={getRangeLabel()}
          value={`${stats.totalHours}h`}
          subtext={`${stats.totalSessions} sessions`}
          color="bg-gradient-to-br from-purple-500 to-indigo-600"
        />
      </div>

      {/* Detailed Stats */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Range Selector */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Study Statistics
            </h3>
            <Tabs value={range} onValueChange={(v) => setRange(v as any)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Average Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Average Session
              </p>
              <p className="text-2xl font-bold mt-2">
                {stats.avgDuration} min
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Sessions This {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Year'}
              </p>
              <p className="text-2xl font-bold mt-2">
                {stats.totalSessions}
              </p>
            </div>
          </div>

          {/* Daily Breakdown */}
          {dailyData.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Daily Breakdown</h4>
              <div className="space-y-2">
                {dailyData.map(({ date, hours, sessions }) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600">{sessions} session{sessions !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-indigo-600 min-w-12 text-right">{hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Breakdown */}
          {subjectData.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                By Subject
              </h4>
              <div className="space-y-2">
                {subjectData.map(({ subject, hours, sessions }) => (
                  <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{subject}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600">{sessions} session{sessions !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-purple-600 min-w-12 text-right">{hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {dailyData.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No study sessions recorded for {getRangeLabel().toLowerCase()}.</p>
              <div className="flex justify-center">
                <Link to="/student">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Start a Session</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StudyStats;
