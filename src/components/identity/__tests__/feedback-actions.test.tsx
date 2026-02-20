import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FeedbackActions } from "../feedback-actions";

describe("FeedbackActions", () => {
  it("renders all three buttons", () => {
    render(<FeedbackActions />);
    expect(screen.getByLabelText("Mark as helpful")).toBeInTheDocument();
    expect(screen.getByLabelText("Mark as not helpful")).toBeInTheDocument();
    expect(screen.getByLabelText("Flag for review")).toBeInTheDocument();
  });

  it("fires onHelpful when thumbs up clicked", () => {
    const onHelpful = vi.fn();
    render(<FeedbackActions onHelpful={onHelpful} />);
    fireEvent.click(screen.getByLabelText("Mark as helpful"));
    expect(onHelpful).toHaveBeenCalledOnce();
  });

  it("fires onNotHelpful when thumbs down clicked", () => {
    const onNotHelpful = vi.fn();
    render(<FeedbackActions onNotHelpful={onNotHelpful} />);
    fireEvent.click(screen.getByLabelText("Mark as not helpful"));
    expect(onNotHelpful).toHaveBeenCalledOnce();
  });

  it("fires onFlag when flag clicked", () => {
    const onFlag = vi.fn();
    render(<FeedbackActions onFlag={onFlag} />);
    fireEvent.click(screen.getByLabelText("Flag for review"));
    expect(onFlag).toHaveBeenCalledOnce();
  });

  it("has correct group role", () => {
    render(<FeedbackActions />);
    expect(screen.getByRole("group")).toHaveAttribute("aria-label", "Feedback actions");
  });
});
