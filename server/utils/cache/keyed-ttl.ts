import type { CreateTtlCacheOptions, TtlCache } from './ttl'
import { createTtlCache } from './ttl'

/**
 * Per-key wrapper around `createTtlCache`.
 *
 * Use when a cache should be partitioned by an external key (e.g. a per-token
 * cache where the token isn't known until the first call). Each key gets its
 * own TTL cache; concurrent first calls for the same key share one in-flight
 * load via the underlying cache.
 */
export function createKeyedTtlCache<K, V>(
  loader: (key: K, signal?: AbortSignal) => Promise<V>,
  opts: CreateTtlCacheOptions
): (key: K, signal?: AbortSignal) => Promise<V> {
  const caches = new Map<K, TtlCache<V>>()

  return async (key, signal) => {
    let c = caches.get(key)
    if (!c) {
      c = createTtlCache(s => loader(key, s), opts)
      caches.set(key, c)
    }
    return c.get(signal)
  }
}
