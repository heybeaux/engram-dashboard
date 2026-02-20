import { cn } from "@/lib/utils";

type StatusColor = "green" | "amber" | "red" | "gray";

interface StatusDotProps {
  color: StatusColor;
  className?: string;
  pulse?: boolean;
}

const colorMap: Record<StatusColor, string> = {
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-gray-400",
};

export function StatusDot({ color, className, pulse }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full shrink-0",
        colorMap[color],
        pulse && "animate-pulse",
        className
      )}
    />
  );
}
