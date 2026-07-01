/**
 * Provider-agnostic chat contract.
 * All providers must return an OpenAI-style SSE Response
 * (`{choices:[{delta:{content?, tool_calls?}, finish_reason?}]}` + `data: [DONE]`).
 * The /api/ai route and the client SSE parser stay unchanged across providers.
 */

export interface ChatRequest {
  systemPrompt: string
  messages: ChatMessage[]
  tools?: ChatTool[]
}

export type ChatMessage
  = | { role: 'user', content: string }
    | {
      role: 'assistant'
      content: string
      toolCalls?: ToolCall[]
    }
    | {
      role: 'tool'
      toolCallId: string
      name?: string
      content: string
    }

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

export interface ChatTool {
  name: string
  description: string
  /** JSON Schema */
  parameters: Record<string, unknown>
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
}
