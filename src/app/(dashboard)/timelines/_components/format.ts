/** Formatting helpers for the Timelines / Arcs views. Dates arrive as
 *  YYYY-MM-DD or ISO strings from the Engram API. */

/** Render a single day as e.g. "Mar 14, 2026". Falls back to the raw value. */
export function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Render a from→to span, collapsing single-day spans. */
export function formatSpan(
  from: string | null | undefined,
  to: string | null | undefined,
): string {
  const start = formatDay(from);
  const end = formatDay(to);
  if (start === end) return start;
  return `${start} → ${end}`;
}
