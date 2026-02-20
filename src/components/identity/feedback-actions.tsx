"use client";

import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackActionsProps {
  onHelpful?: () => void;
  onNotHelpful?: () => void;
  onFlag?: () => void;
  className?: string;
}

export function FeedbackActions({
  onHelpful,
  onNotHelpful,
  onFlag,
  className,
}: FeedbackActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label="Feedback actions">
      <button
        type="button"
        onClick={onHelpful}
        aria-label="Mark as helpful"
        className="rounded p-1 text-muted-foreground hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300 transition-colors"
      >
        <ThumbsUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNotHelpful}
        aria-label="Mark as not helpful"
        className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300 transition-colors"
      >
        <ThumbsDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onFlag}
        aria-label="Flag for review"
        className="rounded p-1 text-muted-foreground hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-900 dark:hover:text-yellow-300 transition-colors"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
