import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Index from "./pages/Index";
import CoursePage from "./pages/CoursePage";
import SummaryPage from "./pages/SummaryPage";
import QuizPage from "./pages/QuizPage";
import CoursesPage from "./pages/CoursesPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/course/:id/summary" element={<SummaryPage />} />
            <Route path="/course/:id/quiz" element={<QuizPage />} />
            <Route path="/course/:id" element={<CoursePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

