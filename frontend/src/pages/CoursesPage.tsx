import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HeaderUtilities from "@/components/HeaderUtilities";

interface CourseOverviewEntry {
  id: number;
  title: string;
  description: string;
  duration: string;
}

const COURSES: CourseOverviewEntry[] = [
  {
    id: 1,
    title: "KI sicher und richtig nutzen",
    description:
      "Unterweisung zur verantwortungsvollen Verwendung von KI in der Verwaltung – rechtliche Grundlagen, Ethik und Praxistipps.",
    duration: "45 Minuten",
  },
];

const CoursesPage = () => {
  const navigate = useNavigate();

  const progressMap = useMemo(() => {
    if (typeof window === "undefined") return new Map<number, string>();
    return new Map(
      COURSES.map((course) => {
        const status = window.localStorage.getItem(`course_${course.id}_status`) ?? "offen";
        return [course.id, status];
      })
    );
  }, []);

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case "summary-preview":
        return "Zusammenfassung gelesen";
      case "content-complete":
        return "Inhalte abgeschlossen";
      case "summary-complete":
        return "Zusammenfassung nach Kurs";
      case "quiz-passed":
        return "Quiz bestanden";
      case "quiz-failed":
        return "Quiz wiederholen";
      default:
        return "Offen";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Kursübersicht</h1>
            <p className="text-sm text-muted-foreground">
              Wählen Sie einen Kurs, verfolgen Sie Ihren Fortschritt und setzen Sie Ihre Lernreise fort.
            </p>
          </div>
          <HeaderUtilities />
        </div>
      </header>

      <div className="flex-1 container mx-auto px-6 py-8 space-y-6">
        {COURSES.map((course) => {
          const status = progressMap.get(course.id);
          const statusLabel = getStatusLabel(status);
          return (
            <Card key={course.id} className="shadow-soft">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>{course.description}</p>
                <p>
                  <strong>Dauer:</strong> {course.duration}
                </p>
                <p>
                  <strong>Aktueller Status:</strong> {statusLabel}
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3">
                <Button className="rounded-xl" onClick={() => navigate(`/course/${course.id}/summary?stage=pre`)}>
                  Zusammenfassung ansehen
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  Kurs starten
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => navigate(`/course/${course.id}/quiz`)}
                >
                  Quiz öffnen
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesPage;
