/**
 * Shared GitHub REST API helpers, reused across the tool endpoints and the
 * resume-gist system prompt loader.
 */

export const GITHUB_API_BASE = 'https://api.github.com'
export const GITHUB_FETCH_TIMEOUT_MS = 10_000

export function githubHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}
