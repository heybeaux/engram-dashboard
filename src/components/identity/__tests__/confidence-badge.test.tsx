import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ConfidenceBadge } from "../confidence-badge";

describe("ConfidenceBadge", () => {
  it("renders high confidence with green styling", () => {
    render(<ConfidenceBadge score={0.9} />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("90%");
    expect(badge).toHaveClass("bg-green-100");
    expect(badge).toHaveAttribute("aria-label", "Confidence: 90% (High)");
  });

  it("renders medium confidence with yellow styling", () => {
    render(<ConfidenceBadge score={0.6} />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("60%");
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("renders low confidence with red styling", () => {
    render(<ConfidenceBadge score={0.3} />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("30%");
    expect(badge).toHaveClass("bg-red-100");
  });

  it("handles boundary at 0.8", () => {
    render(<ConfidenceBadge score={0.8} />);
    expect(screen.getByRole("status")).toHaveClass("bg-green-100");
  });

  it("handles boundary at 0.5", () => {
    render(<ConfidenceBadge score={0.5} />);
    expect(screen.getByRole("status")).toHaveClass("bg-yellow-100");
  });
});
