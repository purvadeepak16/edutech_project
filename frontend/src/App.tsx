import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentQuizzes from "./pages/StudentQuizzes";
import TeacherQuizzes from "./pages/TeacherQuizzes";
import ZombieGame from "./pages/ZombieGame";
import StudyLogs from "./pages/StudyLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/quizzes" element={<StudentQuizzes />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
          <Route path="/zombie" element={<ZombieGame />} />
          <Route path="/study-logs" element={<StudyLogs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
