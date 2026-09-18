import type { AiProvider, PlatformConfig } from './types'
import { createAnthropicPlatform } from './anthropic-platform'

/**
 * MiniMax provider：走 Anthropic 兼容协议（POST {baseUrl}/v1/messages）。
 * 不内置「哪些内容类型可用」的业务判定——由调用方在 `config.contentTypes` 中声明。
 * 参考：https://platform.minimaxi.com/docs/api-reference/text-anthropic-api
 */
export function createMiniMaxProvider(config: PlatformConfig): AiProvider {
  return createAnthropicPlatform({
    name: 'MiniMax',
    defaultBaseUrl: 'https://api.minimaxi.com/anthropic',
    defaultModel: 'MiniMax-M3'
  }, config)
}
