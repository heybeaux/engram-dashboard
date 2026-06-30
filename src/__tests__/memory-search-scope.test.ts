import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EngramClient } from "@/lib/engram-client";

/**
 * Regression for the /memories search bug: typing a term returned nothing for
 * memories that exist under other account users, because the dashboard called
 * POST /v1/memories/query without scope=account. The backend then resolved the
 * missing X-AM-User-ID to the default/login user only.
 *
 * Account-wide search must send ?scope=account; a specific user filter must not.
 */
describe("EngramClient.searchMemories account scoping", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ memories: [], queryTokens: 0, latencyMs: 1 }),
    } as unknown as Response);
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function calledUrl(): string {
    const arg = fetchMock.mock.calls[0]?.[0];
    return typeof arg === "string" ? arg : String(arg);
  }

  it("adds scope=account when searching account-wide", async () => {
    const client = new EngramClient({ baseUrl: "https://example.test" });
    await client.searchMemories("known term", { scope: "account" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calledUrl()).toBe("https://example.test/v1/memories/query?scope=account");
  });

  it("omits scope when a specific user filter is used", async () => {
    const client = new EngramClient({ baseUrl: "https://example.test" });
    await client.searchMemories("known term", { limit: 25 }, "user-123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calledUrl()).toBe("https://example.test/v1/memories/query");

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit & {
      headers: Record<string, string>;
    };
    expect(init.headers["X-AM-User-ID"]).toBe("user-123");
  });
});
