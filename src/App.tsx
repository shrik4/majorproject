
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
import CourseAdminPage from "./pages/CourseAdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AuthCheckAdmin from "./components/AuthCheckAdmin";
import OtherInformationPage from "./pages/OtherInformationPage";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/other-information" element={<OtherInformationPage />} />

          <Route element={<AuthCheckAdmin />}>
            <Route path="/admin/chatbot-qp" element={<ChatbotAdminPage />} />
            <Route path="/admin/study-materials" element={<StudyMaterialAdminPage />} />
            <Route path="/admin/events" element={<EventAdminPage />} />
            <Route path="/admin/courses" element={<CourseAdminPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
