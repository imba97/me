import type { AiProvider, PlatformConfig } from './types'
import { createMiniMaxProvider } from './minimax-cn'

/** 兼容旧名：当前仅 MiniMax provider。 */
export function createAiProvider(config: PlatformConfig): AiProvider {
  return createMiniMaxProvider(config)
}
