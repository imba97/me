/**
 * Provider-agnostic chat message shapes.
 * Shared between server (AI provider implementations) and client (composables, page state).
 * `id` is set by the client for Vue :key stability; the server ignores it.
 */

export interface UserMessage {
  role: 'user'
  id?: string
  content: string
}

export interface AssistantMessage {
  role: 'assistant'
  id?: string
  content: string
  toolCalls?: ToolCall[]
}

export interface ToolMessage {
  role: 'tool'
  id?: string
  toolCallId: string
  name?: string
  content: string
}

export type ChatMessage = UserMessage | AssistantMessage | ToolMessage

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
