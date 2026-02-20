"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackType = "helpful" | "dismiss" | "acted_on";

interface FeedbackActionsProps {
  onFeedback: (type: FeedbackType) => void | Promise<void>;
  selected?: FeedbackType | null;
  size?: "sm" | "default";
  className?: string;
}

export function FeedbackActions({ onFeedback, selected, size = "sm", className }: FeedbackActionsProps) {
  const [loading, setLoading] = useState<FeedbackType | null>(null);

  const handle = async (type: FeedbackType) => {
    setLoading(type);
    try {
      await onFeedback(type);
    } finally {
      setLoading(false as unknown as null);
      setLoading(null);
    }
  };

  const btnClass = (type: FeedbackType) =>
    cn(selected === type && "bg-primary/10 border-primary");

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size={size}
        className={btnClass("helpful")}
        onClick={() => handle("helpful")}
        disabled={loading !== null}
      >
        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
        Helpful
      </Button>
      <Button
        variant="outline"
        size={size}
        className={btnClass("acted_on")}
        onClick={() => handle("acted_on")}
        disabled={loading !== null}
      >
        <Zap className="h-3.5 w-3.5 mr-1" />
        Acted on
      </Button>
      <Button
        variant="outline"
        size={size}
        className={btnClass("dismiss")}
        onClick={() => handle("dismiss")}
        disabled={loading !== null}
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Dismiss
      </Button>
    </div>
  );
}
