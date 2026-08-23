import { describe, it, expect, vi, afterEach } from "vitest";
import { getCurrentWeather } from "@/services/climatempo";

describe("Climatempo fallback handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a fallback payload when the upstream API returns a 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: true, detail: "Service unavailable" }), {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const data = await getCurrentWeather(3427);

    expect(data).toBeTruthy();
    expect(data.name).toBeTruthy();
    expect(data.data.temperature).toBeTypeOf("number");
    expect(data.data.humidity).toBeGreaterThanOrEqual(0);
  });
});
