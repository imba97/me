import type { AiRequest } from '../../utils/ai/wire'
import { createError } from 'h3'
import { createMiniMaxProvider } from '../../utils/ai/platform/minimax-cn'
import { toInternalMessage } from '../../utils/ai/wire'

export default defineEventHandler(async (event) => {
  const body = await readBody<AiRequest>(event)
  const { messages, tools } = body ?? {}
  const { aiApiUrl, aiApiKey, aiModel, aiMaxTokens, githubAccessToken }
    = useRuntimeConfig()

  if (!aiApiUrl || !aiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing AI API configuration'
    })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'messages is required'
    })
  }

  let baseSystemPrompt: string

  try {
    baseSystemPrompt = await getAiSystemPrompt(githubAccessToken)
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Failed to load system prompt'
    throw createError({
      statusCode: 500,
      statusMessage: errMsg
    })
  }

  const systemPrompt = tools && tools.length > 0
    ? `${baseSystemPrompt}\n\n${formatToolDescriptions(tools)}`
    : baseSystemPrompt

  const provider = createMiniMaxProvider({
    baseUrl: aiApiUrl,
    apiKey: aiApiKey,
    model: aiModel,
    maxTokens: aiMaxTokens,
    contentTypes: new Set(['text', 'tool_use', 'tool_result', 'thinking', 'image', 'video'])
  })

  // 客户端断开（新消息打断/离开页面）时中止上游，避免继续消耗 token。
  const ac = new AbortController()
  event.node.req.on('close', () => ac.abort())

  const response = await provider.protocol.chat({
    systemPrompt,
    messages: messages.map(toInternalMessage),
    tools
  }, ac.signal)

  if (!response.ok) {
    const error = await response.text()
    throw createError({
      statusCode: response.status,
      statusMessage: `AI API error: ${error}`
    })
  }

  // Return the upstream Response directly so Nitro streams the body through
  // instead of buffering it. response.body alone is not recognized as a stream.
  return response
})
