import { cn } from "@/lib/utils";

type Status = "active" | "idle" | "offline" | "error";

interface StatusDotProps {
  status: Status;
  pulse?: boolean;
  className?: string;
}

const colorMap: Record<Status, string> = {
  active: "bg-green-500",
  idle: "bg-yellow-500",
  offline: "bg-gray-400",
  error: "bg-red-500",
};

export function StatusDot({ status, pulse = false, className }: StatusDotProps) {
  return (
    <span
      role="status"
      aria-label={`Status: ${status}`}
      className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", colorMap[status], className)}
    >
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colorMap[status],
          )}
        />
      )}
    </span>
  );
}
