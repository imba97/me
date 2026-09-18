import type { ProviderConfig } from '../types'
import type { AiProvider, PlatformConfig } from './types'
import { createAiProtocol } from '../index'
import { AiProtocolName } from '../types'

/** Anthropic 兼容平台的默认值与差异点。 */
interface AnthropicPlatformDefaults {
  /** 平台展示名 */
  name: string
  /** 平台默认 API 地址 */
  defaultBaseUrl: string
  /** 平台默认模型 */
  defaultModel: string
  /** 鉴权方式，默认 x-api-key */
  authStyle?: ProviderConfig['authStyle']
}

/**
 * Anthropic 兼容平台的公共工厂：协议创建 + capabilities 组装。
 * 各平台（MiniMax / Kimi / …）只需声明默认值与鉴权方式。
 */
export function createAnthropicPlatform(
  defaults: AnthropicPlatformDefaults,
  config: PlatformConfig
): AiProvider {
  const protocol = createAiProtocol({
    name: AiProtocolName.Anthropic,
    baseUrl: config.baseUrl || defaults.defaultBaseUrl,
    apiKey: config.apiKey,
    model: config.model || defaults.defaultModel,
    ...(config.maxTokens !== undefined ? { maxTokens: config.maxTokens } : {}),
    ...(defaults.authStyle !== undefined ? { authStyle: defaults.authStyle } : {})
  })

  return {
    name: defaults.name,
    protocol,
    capabilities: {
      contentTypes: config.contentTypes,
      supportsImage: config.contentTypes.has('image')
    }
  }
}
