import { describe, it, expect, vi, afterEach } from "vitest";
import { EngramClient } from "@/lib/engram-client";

type FetchMock = (input: string, init?: RequestInit) => Promise<Response>;

describe("EngramClient arc/timeline methods", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("searchArcs posts the body and returns the arcs envelope", async () => {
    const fetchMock = vi.fn<FetchMock>(async () =>
      new Response(
        JSON.stringify({
          arcs: [
            {
              arcId: "arc-1",
              title: "WhaleHawk launch",
              summary: "3-week push.",
              from: "2026-03-02",
              to: "2026-03-20",
              dayCount: 15,
              score: 0.82,
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new EngramClient({ baseUrl: "https://api.example.test", apiKey: "k" });
    const result = await client.searchArcs({ query: "WhaleHawk", lod: "summary" });

    expect(result.arcs).toHaveLength(1);
    expect(result.arcs[0].arcId).toBe("arc-1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.test/v1/timelines/arc/search");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toMatchObject({ query: "WhaleHawk" });
  });

  it("searchArcs tolerates a missing arcs field", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })));
    const client = new EngramClient({ baseUrl: "https://api.example.test", apiKey: "k" });
    const result = await client.searchArcs({ from: "2026-01-01" });
    expect(result.arcs).toEqual([]);
  });

  it("getArc requests the arc endpoint with the lod query param", async () => {
    const fetchMock = vi.fn<FetchMock>(async () =>
      new Response(
        JSON.stringify([{ agentLocalDate: "2026-03-02", text: "day one" }]),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new EngramClient({ baseUrl: "https://api.example.test", apiKey: "k" });
    const days = await client.getArc("arc-1", "standard");

    expect(days).toHaveLength(1);
    expect(days[0].text).toBe("day one");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/v1/timelines/arc/arc-1?lod=standard",
    );
  });

  it("getTimelines builds query params and unwraps arrays", async () => {
    const fetchMock = vi.fn<FetchMock>(async () =>
      new Response(
        JSON.stringify([{ agentLocalDate: "2026-03-02", text: "day one" }]),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new EngramClient({ baseUrl: "https://api.example.test", apiKey: "k" });
    const days = await client.getTimelines({ from: "2026-03-01", to: "2026-03-31", lod: "index" });

    expect(days).toHaveLength(1);
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("/v1/timelines?");
    expect(url).toContain("from=2026-03-01");
    expect(url).toContain("to=2026-03-31");
    expect(url).toContain("lod=index");
  });
});
