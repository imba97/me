import type { BlogPostFull, BlogPostMeta, SearchPostsArgs, SearchPostsResult } from './types'
import { createTtlCache } from '../cache/ttl'

/**
 * Blog search Worker.
 *
 * Owns two lazy caches (`metaCache`, `fullCache`) and exposes the blog
 * operations the AI tools need. `fullCache` is touched only by
 * `getPostContent` — search never pulls the (large) full payload.
 *
 * Extension model:
 *   - To add a new blog operation: write a new exported function next to
 *     `searchPosts` / `getPostContent`. It can call `metaCache.get(signal)`
 *     or `fullCache.get(signal)` for free and benefit from the same cache +
 *     in-flight dedup. Wire the corresponding tool + endpoint.
 *   - To add a new resource (Steam library, Navidrome queue, …): copy this
 *     directory shape at `server/utils/<resource>/{types,worker}.ts` and
 *     the matching `server/api/tools/<resource>/*.post.ts`. Reuse
 *     `createTtlCache` for the cache layer.
 */

// --- config ---

const META_URL = 'https://imba97.com/search-meta.json'
const FULL_URL = 'https://imba97.com/search-full.json'

const CACHE_TTL_MS = 10 * 60 * 1000
const META_FETCH_TIMEOUT_MS = 15_000
const FULL_FETCH_TIMEOUT_MS = 30_000

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 30

// --- caches ---

const metaCache = createTtlCache(
  (signal): Promise<BlogPostMeta[]> => $fetch<BlogPostMeta[]>(META_URL, { signal }),
  { ttlMs: CACHE_TTL_MS, fetchTimeoutMs: META_FETCH_TIMEOUT_MS }
)

const fullCache = createTtlCache(
  (signal): Promise<BlogPostFull[]> => $fetch<BlogPostFull[]>(FULL_URL, { signal }),
  { ttlMs: CACHE_TTL_MS, fetchTimeoutMs: FULL_FETCH_TIMEOUT_MS }
)

// --- public API ---

/**
 * Search posts.
 * - `query` is a case-insensitive substring match on title + tags + categories.
 * - `tags` / `categories` filter with any-of (OR) semantics; filters AND together.
 * - Results sorted by date descending, sliced to `limit`.
 */
export async function searchPosts(
  args: SearchPostsArgs,
  signal?: AbortSignal
): Promise<SearchPostsResult> {
  const { query, tags, categories } = args ?? {}
  const limit = clampLimit(args?.limit)
  const posts = await metaCache.get(signal)

  const q = query?.trim().toLowerCase() || ''
  const tagSet = tags?.length ? new Set(tags.map(t => t.toLowerCase())) : null
  const catSet = categories?.length ? new Set(categories.map(c => c.toLowerCase())) : null

  const matches: BlogPostMeta[] = []
  for (const post of posts) {
    if (q) {
      const haystack = `${post.title} ${post.tags.join(' ')} ${post.categories.join(' ')}`.toLowerCase()
      if (!haystack.includes(q))
        continue
    }
    if (tagSet && !post.tags.some(t => tagSet.has(t.toLowerCase())))
      continue
    if (catSet && !post.categories.some(c => catSet.has(c.toLowerCase())))
      continue
    matches.push(post)
  }

  matches.sort((a, b) => b.date.localeCompare(a.date))

  return {
    total: matches.length,
    count: Math.min(matches.length, limit),
    posts: matches.slice(0, limit)
  }
}

/**
 * Get a post's full body by id.
 * Returns `null` when the id is not in meta — the endpoint layer uses this
 * to return a structured `notFound: true` rather than a 404, so the LLM
 * can respond gracefully instead of the agentic loop treating it as an error.
 */
export async function getPostContent(
  id: string,
  signal?: AbortSignal
): Promise<BlogPostFull | null> {
  const meta = await metaCache.get(signal)
  if (!meta.some(p => p.id === id))
    return null

  const full = await fullCache.get(signal)
  return full.find(p => p.id === id) ?? null
}

// --- helpers ---

function clampLimit(raw: number | undefined): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw))
    return DEFAULT_LIMIT
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(raw)))
}
