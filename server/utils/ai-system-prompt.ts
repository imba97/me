import { buildAiSystemPrompt } from './ai-system-prompt-local'

const GIST_ID = 'bdc1cb7ad6eb40a7b7a4a1c25accda60'
const RESUME_FILE = 'resume.md'
const CACHE_TTL_MS = 60 * 60 * 1000

interface GistFile {
  content?: string
}

interface GistResponse {
  files?: Record<string, GistFile>
}

let cache: { content: string, fetchedAt: number } | null = null

async function fetchResumeFromGist(token: string): Promise<string> {
  if (!token) {
    throw new Error('Missing GITHUB_ACCESS_TOKEN')
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.content
  }

  const response = await fetch(`${GITHUB_API_BASE}/gists/${GIST_ID}`, {
    headers: githubHeaders(token)
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch resume gist: ${response.status}`)
  }

  const gist = await response.json() as GistResponse
  const content = gist.files?.[RESUME_FILE]?.content

  if (!content) {
    throw new Error(`Missing ${RESUME_FILE} in gist`)
  }

  cache = { content, fetchedAt: Date.now() }
  return content
}

export async function getAiSystemPrompt(token: string): Promise<string> {
  const resume = await fetchResumeFromGist(token)
  return buildAiSystemPrompt(resume)
}
