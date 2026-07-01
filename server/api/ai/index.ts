import type { ChatMessage, ChatTool, ToolCall } from '~~/shared/ai/chat'
import type { AiProviderName } from '../utils/ai'
import { createError } from 'h3'

interface WireMessage {
  role: 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
}

interface AiRequest {
  messages: WireMessage[]
  tools?: ChatTool[]
}

function toInternalMessage(m: WireMessage): ChatMessage {
  if (m.role === 'tool') {
    return {
      role: 'tool',
      toolCallId: m.tool_call_id ?? '',
      ...(m.name ? { name: m.name } : {}),
      content: m.content
    }
  }
  if (m.role === 'assistant') {
    return {
      role: 'assistant',
      content: m.content,
      ...(m.tool_calls && m.tool_calls.length > 0 ? { toolCalls: m.tool_calls } : {})
    }
  }
  return { role: 'user', content: m.content }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AiRequest>(event)
  const { messages, tools } = body ?? {}
  const { aiApiUrl, aiApiKey, aiProvider, aiModel, aiMaxTokens, githubAccessToken }
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

  const providerName = (aiProvider ?? 'anthropic') as AiProviderName
  if (providerName !== 'openai' && providerName !== 'anthropic') {
    throw createError({
      statusCode: 500,
      statusMessage: `Invalid AI_PROVIDER: ${aiProvider}`
    })
  }

  const provider = createAiProvider({
    name: providerName,
    baseUrl: aiApiUrl,
    apiKey: aiApiKey,
    model: aiModel,
    maxTokens: aiMaxTokens
  })

  const response = await provider.chat({
    systemPrompt,
    messages: messages.map(toInternalMessage),
    tools
  })

  if (!response.ok) {
    const error = await response.text()
    throw createError({
      statusCode: response.status,
      statusMessage: `AI API error: ${error}`
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  return response.body
})
