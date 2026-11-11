import { useEffect } from "react";
import { queries } from "../../cache/queries";
import { prefetch } from "../../cache/use-cached";

type AnyQuery = { key: string; load: () => Promise<unknown> };

const TAB_QUERIES: AnyQuery[] = [queries.stock, queries.shop, queries.suggestions];

/** Load the other tabs' lists once the first screen has painted, so switching tabs shows data at once. */
export function usePrefetchTabs(): void {
  useEffect(() => {
    const start = () => prefetchTabs();

    // Safari has no requestIdleCallback; a short timeout does the same job there.
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(start, { timeout: 1500 });

      return () => window.cancelIdleCallback(handle);
    }

    const handle = globalThis.setTimeout(start, 300);

    return () => globalThis.clearTimeout(handle);
  }, []);
}

/** Start loading every tab's list. */
export function prefetchTabs(): void {
  for (const query of TAB_QUERIES) {
    void prefetch(query);
  }
}

/** Refresh the list behind a tab the moment a finger touches it, before the tap finishes. */
export function prefetchFor(path: string): void {
  const byPath: Record<string, AnyQuery> = {
    "/": queries.recipes,
    "/stock": queries.stock,
    "/shop": queries.shop,
    "/ideas": queries.suggestions,
  };
  const query = byPath[path];

  if (query) {
    void prefetch(query);
  }
}
