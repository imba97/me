/**
 * Blog data shapes — kept server-only since the upstream JSONs are
 * fetched and cached inside the Worker.
 */

export interface BlogPostMeta {
  id: string
  path: string
  title: string
  date: string
  tags: string[]
  categories: string[]
}

export interface BlogPostFull extends BlogPostMeta {
  text: string
}

export interface SearchPostsArgs {
  query?: string
  tags?: string[]
  categories?: string[]
  limit?: number
}

export interface SearchPostsResult {
  /** Matches before applying `limit`. */
  total: number
  /** Matches returned in `posts` (≤ limit). */
  count: number
  posts: BlogPostMeta[]
}
