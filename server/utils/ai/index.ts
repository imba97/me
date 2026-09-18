import type { AiProtocol, ProviderConfig } from './types'
import { createAnthropicProtocol } from './anthropic-protocol'
import { createOpenAIProtocol } from './openai-protocol'
import { AiProtocolName } from './types'

export type AiProtocolOptions = ProviderConfig & { name?: AiProtocolName }

/** 协议工厂：按协议名选定 wire 格式实现。 */
export function createAiProtocol(opts: AiProtocolOptions): AiProtocol {
  const { name = AiProtocolName.Anthropic, ...config } = opts

  switch (name) {
    case AiProtocolName.Anthropic:
      return createAnthropicProtocol(config)
    case AiProtocolName.OpenAI:
      return createOpenAIProtocol(config)
    default:
      throw new Error(`Unknown AI protocol: ${name}`)
  }
}
