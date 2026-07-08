/**
 * Lazy TTL cache with in-flight deduplication.
 *
 * Wraps a `loader` so that the first `get()` triggers the load, subsequent
 * calls within `ttlMs` return the cached value, and concurrent calls during
 * a cold load share a single in-flight promise (no thundering herd).
 *
 * Responsibilities:
 *   - TTL freshness check
 *   - Lazy first load
 *   - In-flight promise deduplication
 *   - Optional per-load timeout
 *   - Manual invalidation via `invalidate()`
 *
 * Non-responsibilities (kept simple on purpose):
 *   - No upstream retry — loaders should handle their own resilience
 *   - No stale-while-revalidate — a stale entry is treated as missing
 *   - No size-bounded eviction — modules hold a few MB, not gigabytes
 */

export interface TtlCache<T> {
  /** Returns the cached value if fresh, otherwise loads via `loader`. */
  get: (signal?: AbortSignal) => Promise<T>
  /** Drops the cached entry; the next `get()` will re-load. */
  invalidate: () => void
}

export interface CreateTtlCacheOptions {
  /** How long a cached value stays fresh, in milliseconds. */
  ttlMs: number
  /**
   * If set, wraps each load in `AbortSignal.timeout(fetchTimeoutMs)`.
   * Ignored when the caller passes their own `signal` — caller-supplied
   * abort wins (typical case: abort on client disconnect).
   */
  fetchTimeoutMs?: number
}

export function createTtlCache<T>(
  loader: (signal?: AbortSignal) => Promise<T>,
  opts: CreateTtlCacheOptions
): TtlCache<T> {
  let entry: { value: T, fetchedAt: number } | null = null
  let inflight: Promise<T> | null = null

  return {
    async get(signal) {
      if (entry && Date.now() - entry.fetchedAt < opts.ttlMs) {
        return entry.value
      }
      if (inflight) {
        return inflight
      }

      inflight = (async () => {
        // Loader receives a real AbortSignal when either the caller or the
        // configured timeout supplies one; otherwise `undefined` (loaders
        // like `fetch`/`$fetch` treat undefined as "never abort").
        const effective = signal
          ?? (opts.fetchTimeoutMs ? AbortSignal.timeout(opts.fetchTimeoutMs) : undefined)
        try {
          const value = await loader(effective)
          entry = { value, fetchedAt: Date.now() }
          return value
        }
        finally {
          inflight = null
        }
      })()
      return inflight
    },
    invalidate() {
      entry = null
    }
  }
}
