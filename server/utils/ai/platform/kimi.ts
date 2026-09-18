import type { AiProvider, PlatformConfig } from './types'
import { createAnthropicPlatform } from './anthropic-platform'

/**
 * Kimi provider：走 Anthropic 兼容协议（POST {baseUrl}/v1/messages）。
 * 与 MiniMax 的差异：鉴权用 Authorization: Bearer（对应官方 ANTHROPIC_AUTH_TOKEN）。
 * 参考：https://platform.moonshot.cn/docs/guide/agent-support#kimi-for-coding
 */
export function createKimiProvider(config: PlatformConfig): AiProvider {
  return createAnthropicPlatform({
    name: 'Kimi',
    defaultBaseUrl: 'https://api.kimi.com/coding',
    defaultModel: 'k3',
    authStyle: 'bearer'
  }, config)
}
