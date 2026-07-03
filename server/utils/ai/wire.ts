import type { ChatImage, ChatMessage, ChatTool, ToolCall } from '~~/shared/ai/chat'

/**
 * HTTP wire format for the AI endpoint. Differs from internal `ChatMessage`
 * in field naming (snake_case for tool calls) and structure (flat role/content).
 * Kept server-side only — the client should never see this shape.
 */

export interface WireMessage {
  role: 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
  image?: ChatImage
}

export interface AiRequest {
  messages: WireMessage[]
  tools?: ChatTool[]
}

export function toInternalMessage(m: WireMessage): ChatMessage {
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
  return { role: 'user', content: m.content, ...(m.image ? { image: m.image } : {}) }
}
