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
  /** 用户粘贴的图片（单张）；仅在最新一条 user 消息随请求发送，历史轮不再携带。 */
  image?: ChatImage
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant'
  content: string
  toolCalls?: ToolCall[]
  /** 客户端标记：这次回答被用户中断；服务端忽略。 */
  aborted?: boolean
  /** 客户端标记：本次回答因上游错误失败；UI 用它渲染错误 + 重试按钮；服务端忽略。 */
  error?: string
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

/** 图片输入（base64）。`data` 为纯 base64，不含 `data:` 前缀。 */
export interface ChatImage {
  /** image/jpeg | image/png | image/gif | image/webp */
  mediaType: string
  data: string
}
