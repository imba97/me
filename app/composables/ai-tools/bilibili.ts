import type { ChatTool } from '~~/shared/ai/chat'
import { createHttpToolProvider } from './http-provider'

const listBangumiTool: ChatTool = {
  name: 'list_bangumi',
  description: 'List the user\'s Bilibili (B站) 追番 list — one page of 30 titles at a time, sorted by most recently watched (first element = most recent). Pass `page` to fetch a specific page (page 1 is the most recent 30). Do NOT proactively ask the user whether to fetch the next page — only re-call when the user explicitly asks for more. Stop when the tool returns `hasMore: false`.',
  parameters: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        description: 'Page number, starting from 1. Increment by 1 on each follow-up call to get the next page. Omit (or pass 1) for the first request.'
      }
    }
  }
}

export function createBilibiliToolProvider() {
  return createHttpToolProvider({
    name: 'bilibili',
    tools: [{ localName: 'list_bangumi', tool: listBangumiTool }]
  })
}
