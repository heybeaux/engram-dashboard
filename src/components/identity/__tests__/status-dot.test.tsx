import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "../status-dot";

describe("StatusDot", () => {
  it("renders active with green", () => {
    render(<StatusDot status="active" />);
    const dot = screen.getByRole("status");
    expect(dot).toHaveClass("bg-green-500");
    expect(dot).toHaveAttribute("aria-label", "Status: active");
  });

  it("renders idle with yellow", () => {
    render(<StatusDot status="idle" />);
    expect(screen.getByRole("status")).toHaveClass("bg-yellow-500");
  });

  it("renders offline with gray", () => {
    render(<StatusDot status="offline" />);
    expect(screen.getByRole("status")).toHaveClass("bg-gray-400");
  });

  it("renders error with red", () => {
    render(<StatusDot status="error" />);
    expect(screen.getByRole("status")).toHaveClass("bg-red-500");
  });

  it("shows pulse animation when pulse=true", () => {
    const { container } = render(<StatusDot status="active" pulse />);
    const pingEl = container.querySelector(".animate-ping");
    expect(pingEl).toBeTruthy();
  });

  it("does not show pulse by default", () => {
    const { container } = render(<StatusDot status="active" />);
    const pingEl = container.querySelector(".animate-ping");
    expect(pingEl).toBeNull();
  });
});
