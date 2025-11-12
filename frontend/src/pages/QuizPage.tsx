import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import HeaderUtilities from "@/components/HeaderUtilities";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface LearningPreferences {
  style: "visual" | "audio" | "text";
  role: string;
  detail: "short" | "balanced" | "in-depth";
  news: boolean;
}

interface CourseData {
  id: string;
  title: string;
  quiz?: QuizQuestion[];
}

interface LeaderboardEntry {
  id: number;
  role: string;
  score: number;
  timeSeconds: number;
  completedAt: string;
}

interface CommunityEntry {
  id: number;
  author: string;
  title: string;
  description: string;
  createdAt: string;
}

const PASS_THRESHOLD = 80;

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id ?? 1);
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<LearningPreferences>({
    style: "visual",
    role: "",
    detail: "balanced",
    news: true,
  });
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
    passed: boolean;
    timeSeconds: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [communityItems, setCommunityItems] = useState<CommunityEntry[]>([]);
  const [newContribution, setNewContribution] = useState({ title: "", description: "" });
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  const leaderboardKey = useMemo(() => `course_${courseId}_leaderboard`, [courseId]);
  const communityKey = useMemo(() => `course_${courseId}_community`, [courseId]);

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

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const data = await api.getCourse(courseId);
        setCourseData(data as CourseData);
        const quizLength = data.quiz?.length ?? 0;
        setSelectedAnswers(Array(quizLength).fill(-1));
        setStartTime(Date.now());
      } catch (error) {
        console.error("Failed to load quiz", error);
        toast.error("Quiz konnte nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(communityKey);
      if (stored) {
        setCommunityItems(JSON.parse(stored) as CommunityEntry[]);
      }
    } catch (error) {
      console.error("Failed to parse community items", error);
    }
  }, [communityKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(leaderboardKey);
      if (!stored) {
        setLeaderboardEntries([]);
        setAverageScore(null);
        return;
      }
      const parsed = JSON.parse(stored) as LeaderboardEntry[];
      setLeaderboardEntries(parsed);
      if (parsed.length) {
        const total = parsed.reduce((acc, entry) => acc + entry.score, 0);
        setAverageScore(Math.round(total / parsed.length));
      } else {
        setAverageScore(null);
      }
    } catch (error) {
      console.error("Failed to read leaderboard", error);
      setLeaderboardEntries([]);
      setAverageScore(null);
    }
  }, [leaderboardKey, result]);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = optionIndex;
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!courseData?.quiz?.length) {
      toast.error("Keine Quizfragen vorhanden.");
      return;
    }

    if (selectedAnswers.some((index) => index === -1)) {
      toast.warning("Bitte beantworten Sie alle Fragen, bevor Sie fortfahren.");
      return;
    }

    const correctCount = courseData.quiz.reduce((acc, question, index) => {
      return acc + (question.answer === selectedAnswers[index] ? 1 : 0);
    }, 0);

    const total = courseData.quiz.length;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= PASS_THRESHOLD;
    const timeSeconds = Math.round((Date.now() - startTime) / 1000);

    const entry: LeaderboardEntry = {
      id: Date.now(),
      role: preferences.role || "Teilnehmende*r",
      score,
      timeSeconds,
      completedAt: new Date().toISOString(),
    };

    try {
      const updatedEntries = [...leaderboardEntries, entry]
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeSeconds - b.timeSeconds;
        })
        .slice(0, 50);
      window.localStorage.setItem(leaderboardKey, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error("Failed to update leaderboard", error);
    }

    window.localStorage.setItem(
      `course_${courseId}_status`,
      passed ? "quiz-passed" : "quiz-failed"
    );

    setResult({ score, correct: correctCount, total, passed, timeSeconds });
  };

  const resetQuiz = () => {
    if (courseData?.quiz) {
      setSelectedAnswers(Array(courseData.quiz.length).fill(-1));
    }
    setResult(null);
    setStartTime(Date.now());
  };

  const handleAddContribution = () => {
    if (!newContribution.title.trim() || !newContribution.description.trim()) {
      toast.warning("Bitte Titel und Beschreibung ausfüllen.");
      return;
    }

    const entry: CommunityEntry = {
      id: Date.now(),
      author: preferences.role || "Teilnehmende*r",
      title: newContribution.title.trim(),
      description: newContribution.description.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...communityItems].slice(0, 20);
    setCommunityItems(updated);
    window.localStorage.setItem(communityKey, JSON.stringify(updated));
    setNewContribution({ title: "", description: "" });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (isLoading || !courseData?.quiz?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Quiz wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Wissenstest – {courseData.title}</h1>
            <p className="text-sm text-muted-foreground">
              Beantworten Sie alle Fragen. Ein Ergebnis von mindestens {PASS_THRESHOLD}% gilt als bestanden.
            </p>
          </div>
          <HeaderUtilities />
        </div>
      </header>

      <div className="flex-1 container mx-auto px-6 py-8 space-y-6">
        {!result ? (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quizfragen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {courseData.quiz!.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <p className="font-semibold text-foreground">
                    Frage {qIndex + 1}: {question.question}
                  </p>
                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[qIndex] === optionIndex;
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          onClick={() => handleSelectAnswer(qIndex, optionIndex)}
                          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card hover:bg-muted/80"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Verbleibende Fragen: {selectedAnswers.filter((answer) => answer === -1).length}
              </p>
              <Button onClick={handleSubmit} className="rounded-xl">
                Antworten bewerten
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="shadow-soft xl:col-span-2">
              <CardHeader>
                <CardTitle>{result.passed ? "Gratulation!" : "Ergebnis"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Sie haben <strong>{result.correct}</strong> von <strong>{result.total}</strong> Fragen richtig beantwortet.
                  Das entspricht einer Punktzahl von <strong>{result.score}%</strong>.
                </p>
                <p>
                  Bearbeitungszeit: <strong>{formatDuration(result.timeSeconds)}</strong>
                </p>
                <Separator />
                {result.passed ? (
                  <div className="space-y-3">
                    <p>
                      Sie haben den Wissenstest erfolgreich bestanden. Ihr Ergebnis wurde dem Leaderboard hinzugefügt.
                    </p>
                    <p>
                      Nutzen Sie die untenstehenden Bereiche zum Austausch und entdecken Sie empfohlene Inhalte Ihrer Kolleginnen und Kollegen.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button className="rounded-xl" onClick={() => navigate("/courses")}>Zur Kursübersicht</Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => navigate(`/course/${courseId}`)}
                      >
                        Kurs erneut ansehen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p>
                      Leider wurde der erforderliche Wert von {PASS_THRESHOLD}% nicht erreicht. Wiederholen Sie gezielt die Inhalte und starten Sie einen neuen Versuch.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button className="rounded-xl" onClick={() => navigate(`/course/${courseId}/summary?stage=post`)}>
                        Zusammenfassung ansehen
                      </Button>
                      <Button variant="outline" className="rounded-xl" onClick={resetQuiz}>
                        Quiz erneut starten
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => navigate(`/course/${courseId}`)}
                      >
                        Kursinhalte wiederholen
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {leaderboardEntries.length === 0 ? (
                  <p>Noch keine Einträge vorhanden.</p>
                ) : (
                  <>
                    {averageScore !== null && (
                      <p>
                        Durchschnittliche Punktzahl: <strong>{averageScore}%</strong>
                      </p>
                    )}
                    <ul className="space-y-2">
                      {leaderboardEntries.slice(0, 5).map((entry, index) => (
                        <li key={entry.id} className="flex items-center justify-between gap-2">
                          <span>
                            {index + 1}. {entry.role || "Teilnehmende*r"}
                          </span>
                          <span className="font-semibold text-foreground">{entry.score}%</span>
                          <span>{formatDuration(entry.timeSeconds)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft xl:col-span-3">
              <CardHeader>
                <CardTitle>Team-Interaktion & Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Team-Austausch</h3>
                    <p className="text-sm">
                      Nutzen Sie die gewohnten internen Kanäle (z. B. MS Teams, Chat oder Diskussionsforen), um Fragen rund um KI-Nutzung zu stellen und Praxisbeispiele zu teilen.
                    </p>
                    <p className="text-sm">
                      Vorschlag: Legen Sie einen themenspezifischen Kanal an ("KI@Verwaltung") und sammeln Sie Best Practices sowie offene Fragen.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Community-Beiträge</h3>
                    <p className="text-sm">
                      Teilen Sie eigene Materialien (z. B. Videos, Podcasts, Tools) oder kommentieren Sie Vorschläge Ihrer Kolleginnen und Kollegen.
                    </p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newContribution.title}
                        onChange={(event) => setNewContribution((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="Titel des Beitrags"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2"
                      />
                      <textarea
                        value={newContribution.description}
                        onChange={(event) => setNewContribution((prev) => ({ ...prev, description: event.target.value }))}
                        placeholder="Kurzbeschreibung oder Link"
                        className="w-full min-h-[120px] rounded-xl border border-border bg-background px-3 py-2"
                      />
                      <Button type="button" onClick={handleAddContribution} className="rounded-xl">
                        Beitrag hinzufügen
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {communityItems.length === 0 ? (
                    <p className="text-sm">Noch keine Community-Beiträge vorhanden.</p>
                  ) : (
                    communityItems.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-foreground">{item.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm mt-2 whitespace-pre-line">{item.description}</p>
                        <p className="mt-3 text-xs text-muted-foreground">Vorgeschlagen von {item.author || "Teilnehmende*r"}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft xl:col-span-3">
              <CardHeader>
                <CardTitle>Weiterführende Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Best Practices teilen:</strong> Dokumentieren Sie erfolgreiche KI-Einsatzfälle und teilen Sie diese in der Community.
                </p>
                <p>
                  <strong>Weiterlernen:</strong> Buchen Sie vertiefende Workshops oder vereinbaren Sie eine Session mit dem Datenschutzteam.
                </p>
                <p>
                  <strong>Feedback geben:</strong> Nutzen Sie das Feedback-Formular, um den Kurs weiterzuentwickeln.
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate(`/course/${courseId}/summary?stage=post`)}>
                  Zusammenfassung anzeigen
                </Button>
                <Button variant="ghost" className="rounded-xl" onClick={() => navigate(`/course/${courseId}`)}>
                  Inhalte wiederholen
                </Button>
                <Button className="rounded-xl" onClick={() => resetQuiz()}>
                  Quiz erneut starten
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
