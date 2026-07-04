import { describe, it, expect } from "vitest";
import { formatDay, formatSpan } from "../format";

describe("formatDay", () => {
  it("renders a bare YYYY-MM-DD as that same local calendar day (no TZ shift)", () => {
    // Regression: new Date('2026-05-04') is UTC-midnight and rendered a day
    // early in negative-offset zones (e.g. Pacific showed 'May 3, 2026').
    const out = formatDay("2026-05-04");
    expect(out).toContain("4");
    expect(out).toContain("2026");
    expect(out).not.toContain("3,");
  });

  it("returns an em dash for empty input", () => {
    expect(formatDay(null)).toBe("—");
    expect(formatDay(undefined)).toBe("—");
  });

  it("falls back to the raw value for unparseable input", () => {
    expect(formatDay("not-a-date")).toBe("not-a-date");
  });
});

describe("formatSpan", () => {
  it("collapses a single-day span", () => {
    expect(formatSpan("2026-05-04", "2026-05-04")).toBe(formatDay("2026-05-04"));
  });

  it("renders a from -> to span", () => {
    expect(formatSpan("2026-05-04", "2026-05-06")).toContain("→");
  });
});
