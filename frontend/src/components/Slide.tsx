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
  const bulletPoints = slide.bulletPoints ?? [];
  const hasVideo = Boolean(slide.video);
  const hasAudio = Boolean(slide.audio);
  const hasImage = Boolean(slide.image);

  return (
    <div className="bg-card rounded-2xl shadow-neumorphic p-8 min-h-[600px] flex flex-col">
      <h2 className="text-2xl font-bold text-foreground mb-6">{slide.title}</h2>
      {slide.content && (
        <p className="text-foreground text-lg leading-relaxed mb-6">{slide.content}</p>
      )}

      {/* Media for visual learners */}
      {preferences.style === "visual" && (
        <div className="mb-6 space-y-4">
          {hasVideo ? (
            <div className="rounded-xl overflow-hidden shadow-soft-md">
              <video
                controls
                className="w-full h-auto rounded-xl"
                src={slide.video}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : hasImage ? (
            <div className="rounded-xl overflow-hidden shadow-soft-md">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Audio for auditory learners */}
      {preferences.style === "audio" && hasAudio && (
        <div className="mb-6">
          <audio controls className="w-full rounded-xl">
            <source src={slide.audio} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Bullet list for all styles */}
      {bulletPoints.length > 0 && (
        <div className="mt-auto">
          <h3 className="font-semibold text-foreground mb-3">Kernpunkte:</h3>
          <ul className="space-y-2 text-muted-foreground">
            {bulletPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Slide;
