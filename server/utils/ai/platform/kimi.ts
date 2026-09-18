import type { AiProvider, PlatformConfig } from './types'
import { createAiProtocol } from '../index'
import { AiProtocolName } from '../types'

/**
 * Kimi provider：走 Anthropic 兼容协议（POST {baseUrl}/v1/messages）。
 * 与 MiniMax 的差异：鉴权用 Authorization: Bearer（对应官方 ANTHROPIC_AUTH_TOKEN）。
 * 参考：https://platform.moonshot.cn/docs/guide/agent-support#kimi-for-coding
 */
export function createKimiProvider(config: PlatformConfig): AiProvider {
  const protocol = createAiProtocol({
    name: AiProtocolName.Anthropic,
    baseUrl: config.baseUrl || 'https://api.kimi.com/coding',
    apiKey: config.apiKey,
    model: config.model || 'k3',
    ...(config.maxTokens !== undefined ? { maxTokens: config.maxTokens } : {}),
    authStyle: 'bearer'
  })

  return {
    name: 'Kimi',
    protocol,
    capabilities: {
      contentTypes: config.contentTypes,
      supportsImage: config.contentTypes.has('image')
    }
  }
}
