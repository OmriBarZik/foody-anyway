import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { CacheEntry, CachedState } from "./cache.types";

const entries = new Map<string, CacheEntry>();

function entryFor(key: string): CacheEntry {
  let entry = entries.get(key);

  if (!entry) {
    entry = { data: undefined, hasData: false, failed: false, inflight: null, listeners: new Set(), version: 0 };
    entries.set(key, entry);
  }

  return entry;
}

function notify(entry: CacheEntry): void {
  entry.version += 1;

  for (const listener of entry.listeners) {
    listener();
  }
}

/**
 * Load a key into the cache. Calls for a key that is already loading share one request,
 * unless fresh is set: then a new request follows the one already out, so it sees the latest saves.
 */
export function prefetch<T>({
  key,
  load,
  fresh = false,
}: {
  key: string;
  load: () => Promise<T>;
  fresh?: boolean;
}): Promise<void> {
  const entry = entryFor(key);

  if (entry.inflight) {
    return fresh ? entry.inflight.then(() => prefetch({ key, load, fresh: true })) : entry.inflight;
  }

  // A save made while this request was out wins over the older answer it brings back.
  const startedAt = entry.version;
  entry.inflight = load()
    .then((data) => {
      if (entry.version !== startedAt) {
        return;
      }

      entry.data = data;
      entry.hasData = true;
      entry.failed = false;
    })
    .catch(() => {
      entry.failed = true;
    })
    .finally(() => {
      entry.inflight = null;
      notify(entry);
    });

  return entry.inflight;
}

/** The cached answer for a key, if any. */
export function peek<T>(key: string): T | undefined {
  const entry = entries.get(key);

  return entry?.hasData ? (entry.data as T) : undefined;
}

/** Replace a cached answer from outside a screen, after a save that changes it. */
export function writeCache<T>({ key, data }: { key: string; data: T }): void {
  const entry = entryFor(key);
  entry.data = data;
  entry.hasData = true;
  entry.failed = false;
  notify(entry);
}

/** Drop cached answers, for example when the person joins another kitchen or signs out. */
export function clearCache(): void {
  for (const entry of entries.values()) {
    entry.data = undefined;
    entry.hasData = false;
    entry.failed = false;
    notify(entry);
  }
}

/**
 * Show the last answer for a key at once and refresh it in the background.
 * Moving between tabs then paints the screen right away instead of an empty page.
 */
export function useCached<T>({ key, load }: { key: string; load: () => Promise<T> }): CachedState<T> {
  const entry = entryFor(key);

  const subscribe = useCallback(
    (listener: () => void) => {
      const current = entryFor(key);
      current.listeners.add(listener);

      return () => {
        current.listeners.delete(listener);
      };
    },
    [key],
  );

  useSyncExternalStore(
    subscribe,
    () => entryFor(key).version,
    () => 0,
  );

  useEffect(() => {
    void prefetch({ key, load });
    // The loader is tied to the key; a new function each render must not reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (update: T | ((current: T | undefined) => T)) => {
      const current = entryFor(key);
      const next =
        typeof update === "function"
          ? (update as (value: T | undefined) => T)(current.hasData ? (current.data as T) : undefined)
          : update;
      writeCache({ key, data: next });
    },
    [key],
  );

  const reload = useCallback(() => {
    void prefetch({ key, load, fresh: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: entry.hasData ? (entry.data as T) : undefined,
    failed: entry.failed && !entry.hasData,
    set,
    reload,
  };
}
