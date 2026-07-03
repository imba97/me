import type { AiProtocol, ProviderConfig } from './types'
import { createAnthropicProtocol } from './anthropic-protocol'
import { createOpenAIProtocol } from './openai-protocol'
import { AiProtocolName } from './types'

export interface AiProtocolOptions {
  name?: AiProtocolName
  baseUrl: string
  apiKey: string
  model: string
  maxTokens?: number
}

/** 协议工厂：按协议名选定 wire 格式实现。 */
export function createAiProtocol(opts: AiProtocolOptions): AiProtocol {
  const config: ProviderConfig = {
    baseUrl: opts.baseUrl,
    apiKey: opts.apiKey,
    model: opts.model,
    ...(opts.maxTokens !== undefined ? { maxTokens: opts.maxTokens } : {})
  }

  switch (opts.name ?? AiProtocolName.Anthropic) {
    case AiProtocolName.Anthropic:
      return createAnthropicProtocol(config)
    case AiProtocolName.OpenAI:
      return createOpenAIProtocol(config)
    default:
      throw new Error(`Unknown AI protocol: ${opts.name}`)
  }
}
