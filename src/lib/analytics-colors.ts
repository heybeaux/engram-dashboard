/**
 * Color constants for analytics charts
 * Based on the Memory Analytics spec
 */

export const TYPE_COLORS: Record<string, string> = {
  CONSTRAINT: "#EF4444", // Red
  PREFERENCE: "#8B5CF6", // Purple
  FACT: "#3B82F6",       // Blue
  TASK: "#EAB308",       // Yellow
  EVENT: "#22C55E",      // Green
  LESSON: "#F97316",     // Orange
};

export const LAYER_COLORS: Record<string, string> = {
  IDENTITY: "#3B82F6",   // Blue
  PROJECT: "#22C55E",    // Green
  SESSION: "#EAB308",    // Yellow
  TASK: "#8B5CF6",       // Purple
};

// Tailwind classes for layers (for progress bars)
export const LAYER_CLASSES: Record<string, string> = {
  IDENTITY: "bg-blue-500",
  PROJECT: "bg-green-500",
  SESSION: "bg-yellow-500",
  TASK: "bg-purple-500",
};

// Memory type display names
export const TYPE_LABELS: Record<string, string> = {
  CONSTRAINT: "Constraint",
  PREFERENCE: "Preference",
  FACT: "Fact",
  TASK: "Task",
  EVENT: "Event",
  LESSON: "Lesson",
};

// Layer display names
export const LAYER_LABELS: Record<string, string> = {
  IDENTITY: "Identity",
  PROJECT: "Project",
  SESSION: "Session",
  TASK: "Task",
};
