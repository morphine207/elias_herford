import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Headphones, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import aiAvatar from "@/assets/ai-avatar.png";

interface LearningPreferences {
  style: "visual" | "audio" | "text";
  role: string;
  detail: "short" | "balanced" | "in-depth";
  news: boolean;
}

const PreferencesPrompt = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<LearningPreferences>({
    style: "visual",
    role: "",
    detail: "balanced",
    news: true,
  });

  const handleSubmit = () => {
    localStorage.setItem("userPrefs", JSON.stringify(preferences));
    navigate("/course/1");
  };

  const learningStyles = [
    {
      id: "visual" as const,
      icon: Eye,
      label: "Visual Learner",
      description: "Learn best through images and diagrams",
    },
    {
      id: "audio" as const,
      icon: Headphones,
      label: "Audio Learner",
      description: "Learn best through listening",
    },
    {
      id: "text" as const,
      icon: List,
      label: "Text Learner",
      description: "Learn best through reading",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive text-white font-bold">
                KP
              </div>
            </div>
            <nav className="flex gap-6">
              <a href="/" className="text-primary font-medium border-b-2 border-primary pb-1">
                Home
              </a>
              <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About Learning Platform
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Customize Your Learning Experience
            </h1>
            <p className="text-lg text-muted-foreground">
              Tell us how you learn best — we'll personalize your course style.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Learning Style Cards */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {learningStyles.map((style) => {
                  const Icon = style.icon;
                  const isSelected = preferences.style === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setPreferences({ ...preferences, style: style.id })}
                      className={`p-6 rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? "bg-card shadow-neumorphic border-2 border-primary"
                          : "bg-card shadow-soft hover:shadow-soft-md border-2 border-transparent"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={`p-4 rounded-xl ${
                            isSelected ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              isSelected ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <span
                          className={`font-semibold ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {style.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Form Section */}
              <div className="bg-card rounded-2xl shadow-soft p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Your Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Data Analyst, Manager, Developer"
                    value={preferences.role}
                    onChange={(e) => setPreferences({ ...preferences, role: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail">Preferred Detail Level</Label>
                  <Select
                    value={preferences.detail}
                    onValueChange={(value: "short" | "balanced" | "in-depth") =>
                      setPreferences({ ...preferences, detail: value })
                    }
                  >
                    <SelectTrigger id="detail" className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="in-depth">In-depth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="news" className="cursor-pointer">
                    Show relevant technical news and updates
                  </Label>
                  <Switch
                    id="news"
                    checked={preferences.news}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, news: checked })
                    }
                  />
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleSubmit}
                className="w-full rounded-xl py-6 text-lg font-semibold shadow-soft-md hover:shadow-soft-lg transition-all"
                size="lg"
              >
                Continue
              </Button>
            </div>

            {/* AI Avatar */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-card rounded-2xl shadow-soft p-8 relative">
                <img
                  src={aiAvatar}
                  alt="AI Learning Assistant"
                  className="w-full h-auto"
                />
                <div className="absolute -top-3 right-8 bg-white rounded-xl shadow-soft-md px-4 py-2 border border-border">
                  <p className="text-sm font-medium text-foreground">Let's get started!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PreferencesPrompt;
