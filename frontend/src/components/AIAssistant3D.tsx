import aiAvatar from "@/assets/ai-avatar.png";
import { MessageCircle } from "lucide-react";

const AIAssistant3D = () => {
  return (
    <div className="bg-gradient-to-br from-accent/30 to-accent/10 rounded-2xl shadow-soft p-6 border border-accent">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <img
            src={aiAvatar}
            alt="AI Learning Assistant"
            className="w-32 h-32 object-contain animate-bounce-slow"
          />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-secondary rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            AI Assistant
          </h3>
          <p className="text-sm text-muted-foreground">
            I'm here to help you understand this topic better!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant3D;
