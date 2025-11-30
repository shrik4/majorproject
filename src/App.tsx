
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatbotPage from "./pages/ChatbotPage";
import NavigationPage from "./pages/NavigationPage";
import NotFound from "./pages/NotFound";
import QuestionPaperPage from "./pages/QuestionPaperPage";
import EventsPage from "./pages/EventsPage";
import CoursePage from "./pages/CoursePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ChatbotAdminPage from "./pages/ChatbotAdminPage";
import StudyMaterialAdminPage from "./pages/StudyMaterialAdminPage";
import EventAdminPage from "./pages/EventAdminPage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import CourseAdminPage from "./pages/CourseAdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AuthCheckAdmin from "./components/AuthCheckAdmin";
import OtherInformationPage from "./pages/OtherInformationPage";
import YoutubeSearchPage from "./pages/YoutubeSearchPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import ExamHallAdminPage from "./pages/ExamHallAdminPage";
import ExamHallFinderPage from "./pages/ExamHallFinderPage";
import OpeningAnimation from "./components/OpeningAnimation";
import UserProfilePage from "./pages/UserProfilePage";
import JobSearchPage from "./pages/JobSearchPage";
import StudentPerformanceAnalyzerPage from "./pages/StudentPerformanceAnalyzerPage";
import StudentUploadPage from "./pages/StudentUploadPage";
import SelectSemesterPage from "./pages/SelectSemesterPage";
import SelectInternalsPage from "./pages/SelectInternalsPage";
import SemesterResultUploadPage from "./pages/SemesterResultUploadPage";
import AssignmentMarksEntryPage from "./pages/AssignmentMarksEntryPage";
import SubjectAdminPage from "./pages/SubjectAdminPage";
import ClassToppersPage from "./pages/ClassToppersPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import AIStudyBuddyPage from "./pages/AIStudyBuddyPage";
const queryClient = new QueryClient();

const App = () => {
  const [animationCompleted, setAnimationCompleted] = useState(false);

  const handleAnimationComplete = () => {
    setAnimationCompleted(true);
  };

  return (
    <>
      {!animationCompleted && <OpeningAnimation onAnimationComplete={handleAnimationComplete} />}
      <div style={{ display: animationCompleted ? 'block' : 'none' }}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/navigation" element={<NavigationPage />} />
                <Route path="/question-papers" element={<QuestionPaperPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/youtube-search" element={<YoutubeSearchPage />} />
                <Route path="/other-information" element={<OtherInformationPage />} />
                <Route path="/exam-hall-finder" element={<ExamHallFinderPage />} />
                <Route path="/study-materials" element={<StudyMaterialsPage />} />
                <Route path="/resume-builder" element={<ResumeBuilderPage />} />
                <Route path="/user-profile" element={<UserProfilePage />} />
                <Route path="/job-search" element={<JobSearchPage />} />

                <Route path="/student-upload" element={<StudentUploadPage />} />
                <Route path="/select-semester" element={<SelectSemesterPage />} />
                <Route path="/select-internals" element={<SelectInternalsPage />} />
                <Route path="/upload-semester-result" element={<SemesterResultUploadPage />} />
                <Route path="/assignment-marks-entry" element={<AssignmentMarksEntryPage />} />
                <Route path="/study-buddy" element={<AIStudyBuddyPage />} />

                <Route element={<AuthCheckAdmin />}>
                  <Route path="/admin/chatbot-qp" element={<ChatbotAdminPage />} />
                  <Route path="/admin/study-materials" element={<StudyMaterialAdminPage />} />
                  <Route path="/admin/events" element={<EventAdminPage />} />
                  <Route path="/admin/courses" element={<CourseAdminPage />} />
                  <Route path="/admin/subjects" element={<SubjectAdminPage />} />
                  <Route path="/admin/exam-hall" element={<ExamHallAdminPage />} />
                  <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                  <Route path="/performance-analyzer" element={<StudentPerformanceAnalyzerPage />} />
                  <Route path="/class-toppers" element={<ClassToppersPage />} />
                  <Route path="/admin/notifications" element={<NotificationSettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </div>
    </>
  );
};

export default App;
