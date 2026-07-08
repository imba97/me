import type { SearchPostsArgs } from '../../../utils/blog/types'
import { searchPosts } from '../../../utils/blog/worker'

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody<SearchPostsArgs>(event).catch(() => ({}))) ?? {}
    return await searchPosts(body)
  }
  catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: `Blog search failed: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
