import { createKeyedTtlCache } from '~~/server/utils/cache/keyed-ttl'

interface RepoMeta {
  name: string
  fullName: string
  description: string | null
  language: string | null
}

const USER_CACHE_TTL_MS = 60 * 60 * 1000
const README_MAX_CHARS = 8000

const REPO_NAME_RE = /^[\w.-]+$/
const FULL_NAME_RE = /^[\w.-]+\/[\w.-]+$/

async function loadAuthenticatedUser(token: string, signal?: AbortSignal): Promise<string> {
  const user = await $fetch<{ login: string }>(`${GITHUB_API_BASE}/user`, {
    headers: githubHeaders(token),
    signal
  })
  return user.login
}

const getAuthenticatedUser = createKeyedTtlCache(loadAuthenticatedUser, {
  ttlMs: USER_CACHE_TTL_MS,
  fetchTimeoutMs: GITHUB_FETCH_TIMEOUT_MS
})

function resolveRepo(name: string, owner: string): { owner: string, name: string } {
  if (name.includes('/')) {
    const [o, n] = name.split('/', 2)
    return { owner: o!, name: n! }
  }
  return { owner, name }
}

export default defineEventHandler(async (event): Promise<{ repo: RepoMeta, readme: string }> => {
  const { githubAccessToken } = useRuntimeConfig()
  const { name } = await readBody<{ name: string }>(event)

  if (!githubAccessToken) {
    throw createError({ statusCode: 500, statusMessage: 'Missing GITHUB_ACCESS_TOKEN' })
  }

  const trimmed = name?.trim()
  if (!trimmed) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }
  if (trimmed.includes('/') && !FULL_NAME_RE.test(trimmed)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid name format' })
  }
  if (!trimmed.includes('/') && !REPO_NAME_RE.test(trimmed)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid name format' })
  }

  const owner = await getAuthenticatedUser(githubAccessToken)
  const { owner: repoOwner, name: repoName } = resolveRepo(trimmed, owner)
  const fullName = `${repoOwner}/${repoName}`

  const headers = githubHeaders(githubAccessToken)

  const meta = await $fetch<any>(`${GITHUB_API_BASE}/repos/${fullName}`, {
    headers,
    signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS)
  })

  let readme = ''
  try {
    const raw = await $fetch<string>(`${GITHUB_API_BASE}/repos/${fullName}/readme`, {
      headers: { ...headers, Accept: 'application/vnd.github.raw' },
      responseType: 'text',
      signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS)
    })
    readme = raw.length > README_MAX_CHARS
      ? `${raw.slice(0, README_MAX_CHARS)}\n\n[... README 已截断，原始长度 ${raw.length} 字符]`
      : raw
  }
  catch {
    readme = ''
  }

  return {
    repo: {
      name: meta.name,
      fullName: meta.full_name,
      description: meta.description,
      language: meta.language
    },
    readme
  }
})
