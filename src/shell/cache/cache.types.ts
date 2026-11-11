/** One cached API answer and who is watching it. */
export type CacheEntry = {
  data: unknown;
  hasData: boolean;
  failed: boolean;
  inflight: Promise<void> | null;
  listeners: Set<() => void>;
  version: number;
};

/** What a screen reads from the cache. */
export type CachedState<T> = {
  /** Last good answer, kept while a fresh one loads. Undefined until the first answer. */
  data: T | undefined;
  /** The last load failed and there is nothing to show. */
  failed: boolean;
  /** Replace the cached answer, for optimistic edits. */
  set: (update: T | ((current: T | undefined) => T)) => void;
  /** Load again in the background. */
  reload: () => void;
};
