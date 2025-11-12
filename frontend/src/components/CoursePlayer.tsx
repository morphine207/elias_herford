import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Slide from "./Slide";
import NewsBox from "./NewsBox";
import AIAssistant3D from "./AIAssistant3D";
import FeedbackModal from "./FeedbackModal";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HeaderUtilities from "@/components/HeaderUtilities";

interface SlideData {
  id: number;
  type: "content" | "quiz";
  title: string;
  topic: string;
  content?: string;
  bulletPoints?: string[];
  image?: string;
  video?: string;
  audio?: string;
  keywords?: string[];
}

interface CourseMedia {
  audio?: string;
  video?: string;
}

interface CourseData {
  id: string;
  title: string;
  media?: CourseMedia;
  slides: SlideData[];
}

interface LearningPreferences {
  style: "visual" | "audio" | "text";
  role: string;
  detail: "short" | "balanced" | "in-depth";
  news: boolean;
}

interface CoursePlayerProps {
  courseId: number;
}

const CoursePlayer = ({ courseId }: CoursePlayerProps) => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<LearningPreferences>({
    style: "visual",
    role: "",
    detail: "balanced",
    news: true,
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const storedPrefs = localStorage.getItem("userPrefs");
    if (storedPrefs) {
      try {
        setPreferences(JSON.parse(storedPrefs));
      } catch (e) {
        console.error("Failed to parse preferences:", e);
      }
    }

    // Fetch course data from API
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        const data = await api.getCourse(courseId);
        setCourseData(data);
      } catch (error) {
        console.error("Failed to load course:", error);
        toast.error("Failed to load course. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNext = () => {
    if (!courseData) {
      return;
    }

    if (currentSlideIndex < courseData.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      return;
    }

    handleCompleteCourse();
  };

  const handleCompleteCourse = () => {
    localStorage.setItem(`course_${courseId}_status`, "content-complete");
    navigate(`/course/${courseId}/summary?stage=post`);
  };

  if (isLoading || !courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  const currentSlide = courseData.slides[currentSlideIndex];
  const displaySlide: SlideData = {
    ...currentSlide,
    audio: currentSlide.audio ?? courseData.media?.audio,
    video: currentSlide.video ?? courseData.media?.video,
  };
  const isLastSlide = currentSlideIndex === courseData.slides.length - 1;
  const progress = ((currentSlideIndex + 1) / courseData.slides.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">{courseData.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span>
                    Slide {currentSlideIndex + 1} of {courseData.slides.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HeaderUtilities />
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(true)}
                className="rounded-xl"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Feedback
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-6 container mx-auto px-6 py-6">
        {/* Left Navigation */}
        <aside className="col-span-2 space-y-2">
          <div className="bg-card rounded-xl shadow-soft p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Slides</h3>
            <div className="space-y-2">
              {courseData.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    index === currentSlideIndex
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium">{index + 1}</span>
                    {index === currentSlideIndex && (
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Slide Content */}
        <main className="col-span-7 space-y-6">
          {preferences.style === "visual" && courseData.media?.video && !currentSlide.video && (
            <div className="bg-muted/40 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Kursvideo</h3>
              <video controls className="w-full rounded-xl" src={courseData.media.video}>
                Your browser does not support the video element.
              </video>
            </div>
          )}
          {preferences.style === "audio" && courseData.media?.audio && !currentSlide.audio && (
            <div className="bg-muted/40 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Audioversion</h3>
              <audio controls className="w-full">
                <source src={courseData.media.audio} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          <Slide slide={displaySlide} preferences={preferences} />
        </main>

        {/* Right Sidebar - AI Assistant & News */}
        <aside className="col-span-3 space-y-6">
          <AIAssistant3D />
          {preferences.news && (
            <NewsBox 
              topic={currentSlide.topic} 
              keywords={currentSlide.keywords}
            />
          )}
        </aside>
      </div>

      {/* Bottom Navigation */}
      <footer className="border-t border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSlideIndex === 0}
              className="rounded-xl"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Progress: {Math.round(progress)}%
              </span>
            </div>
            <Button onClick={handleNext} className="rounded-xl">
              {isLastSlide ? "Zur Zusammenfassung" : "Weiter"}
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        slideId={currentSlide.id}
        courseId={courseId}
      />
    </div>
  );
};

export default CoursePlayer;
