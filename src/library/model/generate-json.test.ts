import { afterEach, expect, test, vi } from "vitest";

import { silentExtractionLog } from "../extraction/extraction-log";
import type { ExtractionLog } from "../extraction/extraction.types";
import { generateJson } from "./generate-json";

const API_KEY = "AIza-test-key-123";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("a Gemini error logs its status and body without the API key", async () => {
  const lines: string[] = [];
  const log: ExtractionLog = {
    ...silentExtractionLog(),
    error: (entry) => lines.push(JSON.stringify(entry)),
  };
  const fetchMock = vi.fn(
    async () => new Response(`{"error":{"message":"API key ${API_KEY} not valid"}}`, { status: 400 }),
  );
  vi.stubGlobal("fetch", fetchMock);

  await expect(
    generateJson({
      apiKey: API_KEY,
      model: "gemini-2.5-flash",
      parts: [{ text: "hi" }],
      kind: "text",
      timeoutMs: 1000,
      log,
    }),
  ).rejects.toThrow("Gemini returned 400.");

  expect(lines.join("\n")).toContain("gemini_http_error");
  expect(lines.join("\n")).toContain("not valid");
  expect(lines.join("\n")).not.toContain(API_KEY);
});

test("the API key is sent in a header, not in the URL", async () => {
  const fetchMock = vi.fn(async () => Response.json({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }));
  vi.stubGlobal("fetch", fetchMock);

  await generateJson({
    apiKey: API_KEY,
    model: "gemini-2.5-flash",
    parts: [{ text: "hi" }],
    kind: "text",
    timeoutMs: 1000,
    log: silentExtractionLog(),
  });

  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];

  expect(url).not.toContain(API_KEY);
  expect(new Headers(init.headers).get("x-goog-api-key")).toBe(API_KEY);
});
