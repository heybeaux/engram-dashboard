import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InsightTypeBadge } from "../insight-type-badge";

describe("InsightTypeBadge", () => {
  it("renders pattern with blue", () => {
    render(<InsightTypeBadge type="pattern" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Pattern");
    expect(badge).toHaveClass("bg-blue-100");
  });

  it("renders anomaly with purple", () => {
    render(<InsightTypeBadge type="anomaly" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Anomaly");
    expect(badge).toHaveClass("bg-purple-100");
  });

  it("renders suggestion with green", () => {
    render(<InsightTypeBadge type="suggestion" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Suggestion");
    expect(badge).toHaveClass("bg-green-100");
  });

  it("renders warning with orange", () => {
    render(<InsightTypeBadge type="warning" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Warning");
    expect(badge).toHaveClass("bg-orange-100");
  });

  it("has correct aria-label", () => {
    render(<InsightTypeBadge type="anomaly" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Insight type: Anomaly");
  });
});
