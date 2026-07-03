/**
 * Provider-agnostic chat message shapes.
 * Shared between server (AI provider implementations) and client (composables, page state).
 * `id` is set by the client for Vue :key stability; the server ignores it.
 */

interface BaseMessage {
  /** Vue :key for the client; the server ignores it. */
  id?: string
}

export interface UserMessage extends BaseMessage {
  role: 'user'
  content: string
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant'
  content: string
  toolCalls?: ToolCall[]
  /** 客户端标记：这次回答被用户中断；服务端忽略。 */
  aborted?: boolean
}

export interface ToolMessage extends BaseMessage {
  role: 'tool'
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
