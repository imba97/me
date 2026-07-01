interface RepoMeta {
  name: string
  fullName: string
  description: string | null
  language: string | null
}

const CACHE_TTL_MS = 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 10_000
let userCache: { login: string, fetchedAt: number } | null = null

const REPO_NAME_RE = /^[\w.-]+$/
const FULL_NAME_RE = /^[\w.-]+\/[\w.-]+$/

async function getAuthenticatedUser(token: string): Promise<string> {
  if (userCache && Date.now() - userCache.fetchedAt < CACHE_TTL_MS) {
    return userCache.login
  }
  const user = await $fetch<{ login: string }>('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  })
  userCache = { login: user.login, fetchedAt: Date.now() }
  return user.login
}

function resolveRepo(name: string, owner: string): { owner: string, name: string } {
  if (name.includes('/')) {
    const [o, n] = name.split('/', 2)
    return { owner: o!, name: n! }
  }
  return { owner, name }
}

const README_MAX_CHARS = 8000

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

  const headers = {
    'Authorization': `Bearer ${githubAccessToken}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  const meta = await $fetch<any>(`https://api.github.com/repos/${fullName}`, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  })

  let readme = ''
  try {
    const raw = await $fetch<string>(`https://api.github.com/repos/${fullName}/readme`, {
      headers: { ...headers, Accept: 'application/vnd.github.raw' },
      responseType: 'text',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
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
