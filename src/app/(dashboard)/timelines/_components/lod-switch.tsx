"use client";

import { cn } from "@/lib/utils";
import type { TimelineLod } from "@/lib/types";

const LODS: { value: TimelineLod; label: string }[] = [
  { value: "index", label: "Index" },
  { value: "summary", label: "Summary" },
  { value: "standard", label: "Standard" },
];

export function LodSwitch({
  value,
  onChange,
  disabled,
}: {
  value: TimelineLod;
  onChange: (lod: TimelineLod) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Level of detail"
      className="inline-flex rounded-md border bg-muted/40 p-0.5"
    >
      {LODS.map((lod) => {
        const active = lod.value === value;
        return (
          <button
            key={lod.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(lod.value)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {lod.label}
          </button>
        );
      })}
    </div>
  );
}
