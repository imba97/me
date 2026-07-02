/**
 * Server-side types. Chat-message shapes live in `shared/ai/chat.ts` so client and server share them.
 */

import type { ChatMessage, ChatTool } from '~~/shared/ai/chat'

export interface ChatRequest {
  systemPrompt: string
  messages: ChatMessage[]
  tools?: ChatTool[]
}

export interface AIProvider {
  readonly name: string
  chat: (req: ChatRequest) => Promise<Response>
}

export interface ProviderConfig {
  baseUrl: string
  apiKey: string
  model: string
  maxTokens?: number
  /** 启用 Anthropic extended thinking（先思考再回答，会更慢更准） */
  thinking?: boolean
}

export type { ChatMessage, ChatTool, ToolCall } from '~~/shared/ai/chat'
