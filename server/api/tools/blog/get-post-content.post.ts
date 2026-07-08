import { getPostContent } from '../../../utils/blog/worker'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event).catch(() => ({} as { id?: string }))
  const id = body?.id?.trim()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  try {
    const post = await getPostContent(id)
    // Structured "not found" instead of 404 so the LLM can gracefully
    // tell the user "没找到这篇文章" rather than the agentic loop
    // treating it as a hard error.
    return { post, notFound: post === null }
  }
  catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: `Blog post fetch failed: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
