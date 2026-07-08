import { buildAiSystemPrompt } from './ai-system-prompt-local'
import { createKeyedTtlCache } from './cache/keyed-ttl'

const GIST_ID = 'bdc1cb7ad6eb40a7b7a4a1c25accda60'
const RESUME_FILE = 'resume.md'
const CACHE_TTL_MS = 60 * 60 * 1000

interface GistFile {
  content?: string
}

interface GistResponse {
  files?: Record<string, GistFile>
}

async function loadResume(token: string, signal?: AbortSignal): Promise<string> {
  if (!token) {
    throw new Error('Missing GITHUB_ACCESS_TOKEN')
  }

  const response = await fetch(`${GITHUB_API_BASE}/gists/${GIST_ID}`, {
    headers: githubHeaders(token),
    signal
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch resume gist: ${response.status}`)
  }

  const gist = await response.json() as GistResponse
  const content = gist.files?.[RESUME_FILE]?.content

  if (!content) {
    throw new Error(`Missing ${RESUME_FILE} in gist`)
  }

  return content
}

// Per-token cache: in practice the token is a constant from env, but keying
// by token keeps the factory token-agnostic and safe if that ever changes.
const getResume = createKeyedTtlCache(loadResume, {
  ttlMs: CACHE_TTL_MS,
  fetchTimeoutMs: GITHUB_FETCH_TIMEOUT_MS
})

export async function getAiSystemPrompt(token: string): Promise<string> {
  const resume = await getResume(token)
  return buildAiSystemPrompt(resume)
}
