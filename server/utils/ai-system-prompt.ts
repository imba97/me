const GIST_ID = 'bdc1cb7ad6eb40a7b7a4a1c25accda60'
const PROMPT_FILE = 'prompt.txt'
const CACHE_TTL_MS = 60 * 60 * 1000

interface GistFile {
  content?: string
}

interface GistResponse {
  files?: Record<string, GistFile>
}

let cache: { content: string, fetchedAt: number } | null = null

export async function getAiSystemPrompt(token: string): Promise<string> {
  if (!token) {
    throw new Error('Missing GITHUB_ACCESS_TOKEN')
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.content
  }

  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch system prompt gist: ${response.status}`)
  }

  const gist = await response.json() as GistResponse
  const content = gist.files?.[PROMPT_FILE]?.content

  if (!content) {
    throw new Error(`Missing ${PROMPT_FILE} in system prompt gist`)
  }

  cache = { content, fetchedAt: Date.now() }
  return content
}
