import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NewsBox from "@/components/NewsBox";
import AIAssistant3D from "@/components/AIAssistant3D";
import FeedbackModal from "@/components/FeedbackModal";
import { api } from "@/lib/api";
import HeaderUtilities from "@/components/HeaderUtilities";

interface LearningPreferences {
  style: "visual" | "audio" | "text";
  role: string;
  detail: "short" | "balanced" | "in-depth";
  news: boolean;
}

interface CourseSummarySection {
  title?: string;
  highlights?: string[];
  media?: string;
  script?: string;
}

interface CourseSummary {
  overview: string[];
  text: CourseSummarySection;
  visual: CourseSummarySection;
  audio: CourseSummarySection;
}

interface CourseSlide {
  id: number;
  title: string;
  topic: string;
  content?: string;
  bulletPoints?: string[];
  keywords?: string[];
}

interface CourseMedia {
  audio?: string;
  video?: string;
}

interface CourseData {
  id: string;
  title: string;
  summary?: CourseSummary;
  media?: CourseMedia;
  slides: CourseSlide[];
}

const SummaryPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseId = Number(id ?? 1);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [preferences, setPreferences] = useState<LearningPreferences>({
    style: "visual",
    role: "",
    detail: "balanced",
    news: true,
  });

  useEffect(() => {
    const storedPrefs = localStorage.getItem("userPrefs");
    if (storedPrefs) {
      try {
        setPreferences(JSON.parse(storedPrefs));
      } catch (error) {
        console.error("Failed to parse preferences", error);
      }
    }
  }, []);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const stage = searchParams.get("stage") ?? "pre";
  const isPostCourse = stage === "post";

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const data = await api.getCourse(courseId);
        setCourseData(data as CourseData);
      } catch (error) {
        console.error("Failed to load course summary", error);
        toast.error("Could not load the course summary. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [courseId]);

  useEffect(() => {
    if (isPostCourse) {
      localStorage.setItem(`course_${courseId}_status`, "summary-complete");
    } else {
      localStorage.setItem(`course_${courseId}_status`, "summary-preview");
    }
  }, [courseId, isPostCourse]);

  const primaryHighlights = useMemo(() => {
    if (!courseData?.summary) {
      return [];
    }

    switch (preferences.style) {
      case "audio":
        return courseData.summary.audio.highlights ?? courseData.summary.overview;
      case "text":
        return courseData.summary.text.highlights ?? courseData.summary.overview;
      case "visual":
        return courseData.summary.visual.highlights ?? courseData.summary.overview;
      default:
        return courseData.summary.overview;
    }
  }, [courseData?.summary, preferences.style]);

  const primaryMedia = useMemo(() => {
    if (!courseData?.summary) {
      return undefined;
    }
    switch (preferences.style) {
      case "audio":
        return courseData.summary.audio.media ?? courseData.media?.audio;
      case "visual":
        return courseData.summary.visual.media ?? courseData.media?.video;
      default:
        return undefined;
    }
  }, [courseData?.summary, courseData?.media, preferences.style]);

  const summaryScript = courseData?.summary?.audio.script;
  const firstSlide = courseData?.slides?.[0];

  const leaderboardKey = useMemo(() => `course_${courseId}_leaderboard`, [courseId]);
  const leaderboardEntries = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(leaderboardKey);
      if (!stored) return [];
      return JSON.parse(stored) as {
        id: number;
        role: string;
        score: number;
        timeSeconds: number;
        completedAt: string;
      }[];
    } catch {
      return [];
    }
  }, [leaderboardKey]);

  const averageScore = useMemo(() => {
    if (!leaderboardEntries.length) return null;
    const total = leaderboardEntries.reduce((acc, entry) => acc + entry.score, 0);
    return Math.round(total / leaderboardEntries.length);
  }, [leaderboardEntries]);

  const ASSET_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "http://localhost:8000");
  const additionalResources = [
    {
      title: "Unterweisung – Fragenkatalog",
      href: `${ASSET_BASE_URL}/static/docs/UWEB-Nur-Fragen.pdf`,
    },
    {
      title: "Unterweisung – Begleitdokument",
      href: `${ASSET_BASE_URL}/static/docs/UWEB-Ohne-Fragen.pdf`,
    },
  ];

  if (isLoading || !courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Lade Zusammenfassung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{courseData.title}</h1>
            <p className="text-sm text-muted-foreground">
              {isPostCourse
                ? "Zusammenfassung nach Abschluss des Kurses – perfekt zur Vorbereitung auf den Wissenstest."
                : "Individuelle Zusammenfassung basierend auf Ihren Lernpräferenzen – als Einstieg in den Kurs."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <HeaderUtilities />
            {isPostCourse ? (
              <Button className="rounded-xl" onClick={() => navigate(`/course/${courseId}/quiz`)}>
                Quiz starten
              </Button>
            ) : (
              <Button className="rounded-xl" onClick={() => navigate(`/course/${courseId}`)}>
                Kurs starten
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Überblick</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  {courseData.summary?.overview.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>
                  {preferences.style === "visual" && courseData.summary?.visual.title}
                  {preferences.style === "audio" && courseData.summary?.audio.title}
                  {preferences.style === "text" && courseData.summary?.text.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryMedia && preferences.style === "visual" && (
                  <video controls className="w-full rounded-xl">
                    <source src={primaryMedia} />
                    Your browser does not support the video element.
                  </video>
                )}

                {primaryMedia && preferences.style === "audio" && (
                  <audio controls className="w-full">
                    <source src={primaryMedia} />
                    Your browser does not support the audio element.
                  </audio>
                )}

                {preferences.style === "audio" && summaryScript && (
                  <p className="text-sm text-muted-foreground">{summaryScript}</p>
                )}

                <ul className="space-y-2 text-muted-foreground">
                  {primaryHighlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {isPostCourse ? (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Nächste Schritte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Sie haben alle Lerninhalte durchlaufen. Starten Sie jetzt den Wissenstest, um Ihre
                    Kenntnisse zu prüfen. Nach erfolgreichem Abschluss wartet das Leaderboard sowie der Kursüberblick.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => navigate(`/course/${courseId}/quiz`)} className="rounded-xl">
                      Zum Quiz
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFeedbackModal(true)}
                      className="rounded-xl"
                    >
                      Feedback geben
                    </Button>
                  </div>
                  {leaderboardEntries.length > 0 && (
                    <div className="rounded-xl border border-border p-4">
                      <h4 className="font-semibold text-foreground mb-2">Bisherige Quiz-Ergebnisse</h4>
                      <p className="text-sm">
                        Durchschnittliche Punktzahl:{" "}
                        <span className="font-semibold">{averageScore}%</span> · Versuche gesamt:{" "}
                        <span className="font-semibold">{leaderboardEntries.length}</span>
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {leaderboardEntries.slice(0, 3).map((entry) => (
                          <li key={entry.id} className="flex items-center justify-between gap-2">
                            <span>{entry.role || "Teilnehmende*r"}</span>
                            <span className="font-semibold text-foreground">{entry.score}%</span>
                            <span>{entry.timeSeconds}s</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Nächste Schritte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Nutzen Sie die Zusammenfassung, um gezielt in den Kurs einzusteigen. Danach erwarten Sie interaktive Slides,
                    ein Wissenstest und ein Leaderboard zum Vergleich mit Kolleginnen und Kollegen.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => navigate(`/course/${courseId}`)} className="rounded-xl">
                      Zum Kursplayer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFeedbackModal(true)}
                      className="rounded-xl"
                    >
                      Feedback geben
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="col-span-4 space-y-6">
            <AIAssistant3D />
            <Separator />
            {preferences.news && firstSlide && (
              <NewsBox topic={firstSlide.topic} keywords={firstSlide.keywords} />
            )}
            <Separator />
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Ihre Lernpräferenzen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground text-sm">
                <p>
                  <strong>Stil:</strong> {preferences.style === "text" ? "Text" : preferences.style === "visual" ? "Visuell" : "Auditiv"}
                </p>
                {preferences.role && (
                  <p>
                    <strong>Rolle:</strong> {preferences.role}
                  </p>
                )}
                <p>
                  <strong>Detailtiefe:</strong> {preferences.detail}
                </p>
                <p>
                  <strong>News aktiviert:</strong> {preferences.news ? "Ja" : "Nein"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Begleitmaterial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Laden Sie ergänzende Unterlagen zur Unterweisung herunter:</p>
                <ul className="space-y-2">
                  {additionalResources.map((resource) => (
                    <li key={resource.href}>
                      <a
                        href={resource.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        slideId={courseData.slides[0]?.id ?? 0}
        courseId={courseId}
      />
    </div>
  );
};

export default SummaryPage;
