import { createTtlCache } from '~~/server/utils/cache/ttl'

interface Repo {
  name: string
  fullName: string
  description: string | null
  language: string | null
}

const EXTRA_ORGS = ['triggerix-collective']
const CACHE_TTL_MS = 5 * 60 * 1000

async function loadRepos(signal?: AbortSignal): Promise<Repo[]> {
  const { githubAccessToken } = useRuntimeConfig()

  if (!githubAccessToken) {
    throw new Error('Missing GITHUB_ACCESS_TOKEN')
  }

  const headers = githubHeaders(githubAccessToken)

  const [personal, ...orgLists] = await Promise.all([
    $fetch<any[]>(`${GITHUB_API_BASE}/user/repos`, {
      signal,
      headers,
      query: {
        per_page: 100,
        sort: 'pushed',
        affiliation: 'owner,collaborator,organization_member'
      }
    }),
    ...EXTRA_ORGS.map(org =>
      $fetch<any[]>(`${GITHUB_API_BASE}/orgs/${org}/repos`, {
        signal,
        headers,
        query: { per_page: 100, sort: 'pushed', type: 'all' }
      })
    )
  ])

  const seen = new Set<number>()
  return [...personal, ...orgLists.flat()]
    .filter(r => !r.fork && (r.owner?.type === 'User' || r.permissions?.admin || r.permissions?.push))
    .filter((r) => {
      if (seen.has(r.id))
        return false
      seen.add(r.id)
      return true
    })
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, 30)
    .map(r => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      language: r.language
    }))
}

const reposCache = createTtlCache(loadRepos, {
  ttlMs: CACHE_TTL_MS,
  fetchTimeoutMs: GITHUB_FETCH_TIMEOUT_MS
})

export default defineEventHandler(async (): Promise<{ repos: Repo[] }> => {
  try {
    const repos = await reposCache.get()
    return { repos }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to load repos'
    })
  }
})
