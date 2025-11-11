import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideId: number;
  courseId?: number;
}

const FeedbackModal = ({ isOpen, onClose, slideId, courseId }: FeedbackModalProps) => {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        slide_id: slideId,
        rating: rating,
        comment: comment || undefined,
        course_id: courseId,
      });
      
      toast.success("Thank you for your feedback!");
      setRating(null);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">How was this slide?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve the learning experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setRating("positive")}
              className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all ${
                rating === "positive"
                  ? "border-secondary bg-secondary/10 shadow-soft-md"
                  : "border-border hover:border-secondary/50"
              }`}
            >
              <ThumbsUp
                className={`w-8 h-8 ${
                  rating === "positive" ? "text-secondary" : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium">Good</span>
            </button>

            <button
              onClick={() => setRating("negative")}
              className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all ${
                rating === "negative"
                  ? "border-destructive bg-destructive/10 shadow-soft-md"
                  : "border-border hover:border-destructive/50"
              }`}
            >
              <ThumbsDown
                className={`w-8 h-8 ${
                  rating === "negative" ? "text-destructive" : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium">Needs Work</span>
            </button>

            <button
              onClick={() => setRating(null)}
              className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all ${
                rating === null
                  ? "border-primary bg-primary/10 shadow-soft-md"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <MessageSquare
                className={`w-8 h-8 ${
                  rating === null ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium">Comment</span>
            </button>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-foreground">
              Comments (Optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] rounded-xl"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full rounded-xl py-6"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
