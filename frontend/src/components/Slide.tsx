import { Volume2, Play, Pause } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SlideData {
  id: number;
  type: "content" | "quiz";
  title: string;
  topic: string;
  content?: string;
  image?: string;
  video?: string;
  audio?: string;
}

interface LearningPreferences {
  style: "visual" | "audio" | "text";
  role: string;
  detail: "short" | "balanced" | "in-depth";
  news: boolean;
}

interface SlideProps {
  slide: SlideData;
  preferences: LearningPreferences;
}

const Slide = ({ slide, preferences }: SlideProps) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  return (
    <div className="bg-card rounded-2xl shadow-neumorphic p-8 min-h-[600px] flex flex-col">
      <h2 className="text-2xl font-bold text-foreground mb-6">{slide.title}</h2>

      {/* Visual Learner View */}
      {preferences.style === "visual" && (
        <div className="flex-1 space-y-6">
          {slide.image && (
            <div className="rounded-xl overflow-hidden shadow-soft-md">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <div className="bg-muted/50 rounded-xl p-6">
            <p className="text-foreground leading-relaxed">{slide.content}</p>
          </div>
        </div>
      )}

      {/* Audio Learner View */}
      {preferences.style === "audio" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-soft-lg">
            <Volume2 className="w-24 h-24 text-white" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Audio Content</h3>
            <p className="text-muted-foreground max-w-md">
              Listen to this lesson while you work or relax
            </p>
          </div>
          <Button
            onClick={toggleAudio}
            size="lg"
            className="rounded-full px-8 shadow-soft-md"
          >
            {isAudioPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Play Audio
              </>
            )}
          </Button>
          <div className="bg-muted/50 rounded-xl p-6 max-w-2xl">
            <p className="text-sm text-muted-foreground">{slide.content}</p>
          </div>
        </div>
      )}

      {/* Text Learner View */}
      {preferences.style === "text" && (
        <div className="flex-1">
          <div className="prose prose-lg max-w-none">
            <div className="bg-muted/30 rounded-xl p-8 space-y-4">
              <p className="text-foreground leading-relaxed text-lg">{slide.content}</p>
              {slide.image && (
                <div className="rounded-xl overflow-hidden shadow-soft mt-6">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-auto object-cover opacity-70"
                  />
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">Key Takeaways:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Understanding data protection principles is essential</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Compliance with regulations protects both users and organizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Security measures must be implemented at all levels</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slide;
