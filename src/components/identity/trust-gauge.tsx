import { cn } from "@/lib/utils";

interface TrustGaugeProps {
  score: number; // 0.0 - 1.0
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

function getBarColor(score: number): string {
  if (score >= 0.8) return "bg-green-500";
  if (score >= 0.5) return "bg-yellow-500";
  return "bg-red-500";
}

export function TrustGauge({ score, size = "md", className }: TrustGaugeProps) {
  const pct = Math.round(score * 100);
  return (
    <div
      role="meter"
      aria-label={`Trust score: ${pct}%`}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("w-full rounded-full bg-muted", sizeMap[size], className)}
    >
      <div
        className={cn("rounded-full transition-all", sizeMap[size], getBarColor(score))}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
