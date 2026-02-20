import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrustGauge } from "../trust-gauge";

describe("TrustGauge", () => {
  it("renders with correct aria attributes", () => {
    render(<TrustGauge score={0.75} />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "75");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-label", "Trust score: 75%");
  });

  it("renders green bar for high score", () => {
    const { container } = render(<TrustGauge score={0.9} />);
    const bar = container.querySelector(".bg-green-500");
    expect(bar).toBeTruthy();
  });

  it("renders yellow bar for medium score", () => {
    const { container } = render(<TrustGauge score={0.6} />);
    const bar = container.querySelector(".bg-yellow-500");
    expect(bar).toBeTruthy();
  });

  it("renders red bar for low score", () => {
    const { container } = render(<TrustGauge score={0.2} />);
    const bar = container.querySelector(".bg-red-500");
    expect(bar).toBeTruthy();
  });

  it("sets correct width style", () => {
    const { container } = render(<TrustGauge score={0.65} />);
    const bar = container.querySelector("[style]");
    expect(bar).toHaveStyle({ width: "65%" });
  });
});
