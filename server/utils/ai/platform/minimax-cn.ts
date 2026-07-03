import type { AiProvider, PlatformConfig } from './types'
import { createAiProtocol } from '../index'
import { AiProtocolName } from '../types'

/**
 * MiniMax provider：走 Anthropic 兼容协议（POST {baseUrl}/v1/messages）。
 * 不内置「哪些内容类型可用」的业务判定——由调用方在 `config.contentTypes` 中声明。
 * 参考：https://platform.minimaxi.com/docs/api-reference/text-anthropic-api
 */
export function createMiniMaxProvider(config: PlatformConfig): AiProvider {
  const protocol = createAiProtocol({ name: AiProtocolName.Anthropic, ...config })

  return {
    name: 'MiniMax',
    protocol,
    capabilities: {
      contentTypes: config.contentTypes,
      supportsImage: config.contentTypes.has('image')
    }
  }
}
