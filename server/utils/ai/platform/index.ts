import type { AiProvider, PlatformConfig } from './types'
import { createKimiProvider } from './kimi'
import { createMiniMaxProvider } from './minimax-cn'

/** AI provider 名：由环境变量 AI_PROVIDER 控制。 */
export type AiProviderName = 'minimax' | 'kimi'

/** Provider 工厂：按名字选定具体平台实现。 */
export function createAiProvider(name: AiProviderName | string, config: PlatformConfig): AiProvider {
  switch (name) {
    case 'kimi':
      return createKimiProvider(config)
    case 'minimax':
      return createMiniMaxProvider(config)
    default:
      throw new Error(`Unknown AI provider: ${name}`)
  }
}
