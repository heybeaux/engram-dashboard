/** Formatting helpers for the Timelines / Arcs views. Dates arrive as
 *  YYYY-MM-DD or ISO strings from the Engram API. */

/** Render a single day as e.g. "Mar 14, 2026". Falls back to the raw value.
 *  A bare YYYY-MM-DD (the API's agentLocalDate) is parsed as a *local* date so
 *  it isn't shifted a day earlier in negative-UTC-offset timezones. */
export function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
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
