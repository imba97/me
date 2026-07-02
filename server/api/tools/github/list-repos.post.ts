interface Repo {
  name: string
  fullName: string
  description: string | null
  language: string | null
}

const EXTRA_ORGS = ['triggerix-collective']
const CACHE_TTL_MS = 5 * 60 * 1000

let cache: { fetchedAt: number, repos: Repo[] } | null = null

export default defineEventHandler(async (): Promise<{ repos: Repo[] }> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS)
    return { repos: cache.repos }

  const { githubAccessToken } = useRuntimeConfig()

  if (!githubAccessToken) {
    throw createError({ statusCode: 500, statusMessage: 'Missing GITHUB_ACCESS_TOKEN' })
  }

  const headers = githubHeaders(githubAccessToken)

  const fetchOpts = { signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS) }

  const personal = await $fetch<any[]>(`${GITHUB_API_BASE}/user/repos`, {
    ...fetchOpts,
    headers,
    query: {
      per_page: 100,
      sort: 'pushed',
      affiliation: 'owner,collaborator,organization_member'
    }
  })

  const orgLists = await Promise.all(
    EXTRA_ORGS.map(org =>
      $fetch<any[]>(`${GITHUB_API_BASE}/orgs/${org}/repos`, {
        ...fetchOpts,
        headers,
        query: { per_page: 100, sort: 'pushed', type: 'all' }
      })
    )
  )

  const seen = new Set<number>()
  const repos = [...personal, ...orgLists.flat()]
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

  cache = { fetchedAt: Date.now(), repos }
  return { repos }
})
