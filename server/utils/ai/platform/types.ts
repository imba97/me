import type { AiProtocol } from '../types'

/**
 * 平台抽象层。位于 protocol（wire）之上：一个平台（如 MiniMax）选定底层
 * 协议实现，并声明与具体模型相关的能力（支持哪些消息内容类型、是否支持图片等）。
 */

export type MessageContentType
  = | 'text'
    | 'image'
    | 'video'
    | 'tool_use'
    | 'tool_result'
    | 'thinking'

export interface PlatformCapabilities {
  /** 当前 model 支持的消息内容类型 */
  readonly contentTypes: ReadonlySet<MessageContentType>
  /** 便捷派生：是否支持图片输入 */
  readonly supportsImage: boolean
}

export interface PlatformConfig {
  baseUrl: string
  apiKey: string
  model: string
  maxTokens?: number
  /** 该平台对当前 model 暴露的可用内容类型，由调用方按业务声明。 */
  contentTypes: ReadonlySet<MessageContentType>
}

/** 具体 AI provider（如 MiniMax）：选定底层协议实现 + 声明模型相关能力。 */
export interface AiProvider {
  readonly name: string
  /** 底层 wire 协议实现（OpenAI / Anthropic 兼容） */
  readonly protocol: AiProtocol
  /** 基于当前 model 计算出的能力 */
  readonly capabilities: PlatformCapabilities
}
