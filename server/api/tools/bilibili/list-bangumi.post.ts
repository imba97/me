interface BangumiItem {
  title?: string
}

interface BangumiResponse {
  code: number
  message: string
  data?: { list?: BangumiItem[] }
}

interface Body {
  page?: number
}

const VMID = 2198461
const PAGE_SIZE = 30
const FETCH_TIMEOUT_MS = 10_000
const MAX_PAGE = 50

export default defineEventHandler(async (event): Promise<{ titles: string[], page: number, hasMore: boolean }> => {
  try {
    const body = await readBody<Body>(event).catch(() => ({} as Body)) ?? {}
    const page = Math.max(1, Math.min(MAX_PAGE, Math.floor(Number(body.page) || 1)))

    const res = await $fetch<BangumiResponse>('https://api.bilibili.com/x/space/bangumi/follow/list', {
      query: { vmid: VMID, type: 1, pn: page, ps: PAGE_SIZE },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; imba97-me/1.0)',
        'Referer': 'https://space.bilibili.com/'
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    })

    if (res.code !== 0 || !res.data?.list)
      return { titles: [], page, hasMore: false }

    const titles = res.data.list
      .map(item => item.title)
      .filter((t): t is string => Boolean(t))

    return {
      page,
      titles,
      hasMore: res.data.list.length === PAGE_SIZE && page < MAX_PAGE
    }
  }
  catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: `Bilibili request failed: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
