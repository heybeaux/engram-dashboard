import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArcSearchView } from "../arc-search-view";
import type { ArcSearchResult, Timeline } from "@/lib/types";

// Mock the engram client so the search flow can be exercised with fixtures.
const searchArcs = vi.fn();
const getArc = vi.fn();
const getTimelines = vi.fn();

vi.mock("@/lib/engram-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/engram-client")>(
    "@/lib/engram-client",
  );
  return {
    ...actual,
    engram: {
      searchArcs: (...args: unknown[]) => searchArcs(...args),
      getArc: (...args: unknown[]) => getArc(...args),
      getTimelines: (...args: unknown[]) => getTimelines(...args),
    },
  };
});

const ARC: ArcSearchResult = {
  arcId: "arc-whalehawk-launch",
  title: "WhaleHawk launch",
  summary: "3-week push to ship the WhaleHawk launch.",
  from: "2026-03-02",
  to: "2026-03-20",
  dayCount: 15,
  score: 0.82,
  topDays: [{ date: "2026-03-14", score: 0.86 }],
};

const ARC_DAYS: Timeline[] = [
  {
    id: "day-1",
    agentLocalDate: "2026-03-02",
    chapter: "Kickoff",
    arcId: "arc-whalehawk-launch",
    text: "Started the WhaleHawk launch work.",
  },
  {
    id: "day-2",
    agentLocalDate: "2026-03-14",
    chapter: "Crunch",
    arcId: "arc-whalehawk-launch",
    text: "Peak crunch day before ship.",
  },
];

describe("ArcSearchView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTimelines.mockResolvedValue([]);
    getArc.mockResolvedValue(ARC_DAYS);
    searchArcs.mockResolvedValue({ arcs: [ARC] });
  });

  it("renders the browse-by-day fallback when idle", async () => {
    render(<ArcSearchView />);
    expect(screen.getByText(/Browsing daily timelines/i)).toBeInTheDocument();
    await waitFor(() => expect(getTimelines).toHaveBeenCalled());
  });

  it("searches and renders ranked arc result cards", async () => {
    render(<ArcSearchView />);

    fireEvent.change(screen.getByLabelText("Arc search query"), {
      target: { value: "WhaleHawk launch work" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));

    await waitFor(() =>
      expect(searchArcs).toHaveBeenCalledWith(
        expect.objectContaining({ query: "WhaleHawk launch work", lod: "summary" }),
      ),
    );

    expect(await screen.findByText("WhaleHawk launch")).toBeInTheDocument();
    expect(screen.getByText(/1 arc found/i)).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText(/15 days/i)).toBeInTheDocument();
  });

  it("shows a validation error when searching with no criteria", async () => {
    render(<ArcSearchView />);
    fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));
    expect(
      await screen.findByText(/Enter a search query or pick a date range/i),
    ).toBeInTheDocument();
    expect(searchArcs).not.toHaveBeenCalled();
  });

  it("renders the empty state when no arcs match", async () => {
    searchArcs.mockResolvedValue({ arcs: [] });
    render(<ArcSearchView />);

    fireEvent.change(screen.getByLabelText("Arc search query"), {
      target: { value: "nothing here" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));

    expect(await screen.findByText(/No arcs matched your search/i)).toBeInTheDocument();
  });

  it("renders an error state and retries when the search fails", async () => {
    searchArcs.mockRejectedValueOnce(new Error("upstream down"));
    render(<ArcSearchView />);

    fireEvent.change(screen.getByLabelText("Arc search query"), {
      target: { value: "boom" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));

    expect(await screen.findByText(/upstream down/i)).toBeInTheDocument();

    // Retry now succeeds.
    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));
    expect(await screen.findByText("WhaleHawk launch")).toBeInTheDocument();
  });

  it("opens arc detail and switches LOD", async () => {
    render(<ArcSearchView />);

    fireEvent.change(screen.getByLabelText("Arc search query"), {
      target: { value: "WhaleHawk" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));

    const card = await screen.findByText("WhaleHawk launch");
    fireEvent.click(card);

    // Detail loads member days at default 'summary' LOD.
    await waitFor(() =>
      expect(getArc).toHaveBeenCalledWith("arc-whalehawk-launch", "summary"),
    );
    expect(await screen.findByText(/Started the WhaleHawk launch work/i)).toBeInTheDocument();

    // Switch LOD to 'standard' → refetch.
    const lodGroup = screen.getByRole("radiogroup", { name: /Level of detail/i });
    fireEvent.click(within(lodGroup).getByRole("radio", { name: /Standard/i }));
    await waitFor(() =>
      expect(getArc).toHaveBeenCalledWith("arc-whalehawk-launch", "standard"),
    );
  });
});
