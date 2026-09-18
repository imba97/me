/**
 * Server-side types. Chat-message shapes live in `shared/ai/chat.ts` so client and server share them.
 */

import type { ChatMessage, ChatTool } from '~~/shared/ai/chat'

export interface ChatRequest {
  systemPrompt: string
  messages: ChatMessage[]
  tools?: ChatTool[]
}

export interface AiProtocol {
  readonly name: string
  chat: (req: ChatRequest, signal?: AbortSignal) => Promise<Response>
}

/** 协议名：标识走哪种 wire 格式（OpenAI 兼容 / Anthropic 兼容）。 */
export enum AiProtocolName {
  OpenAI = 'openai',
  Anthropic = 'anthropic'
}

export interface ProviderConfig {
  baseUrl: string
  apiKey: string
  model: string
  maxTokens?: number
  /** 启用 Anthropic extended thinking（先思考再回答，会更慢更准） */
  thinking?: boolean
  /** Anthropic 兼容端的鉴权方式：x-api-key 头（默认）或 Authorization Bearer */
  authStyle?: 'x-api-key' | 'bearer'
}

export type { ChatMessage, ChatTool, ToolCall } from '~~/shared/ai/chat'
