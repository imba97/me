import type { AIProvider, ProviderConfig } from './types'
import { createAnthropicProvider } from './anthropic-provider'
import { createOpenAIProvider } from './openai-provider'

export type AiProviderName = 'openai' | 'anthropic'

export interface AiProviderOptions {
  name?: AiProviderName
  baseUrl: string
  apiKey: string
  model: string
  maxTokens?: number
}

export function createAiProvider(opts: AiProviderOptions): AIProvider {
  const config: ProviderConfig = {
    baseUrl: opts.baseUrl,
    apiKey: opts.apiKey,
    model: opts.model,
    ...(opts.maxTokens !== undefined ? { maxTokens: opts.maxTokens } : {})
  }

  switch (opts.name ?? 'anthropic') {
    case 'anthropic':
      return createAnthropicProvider(config)
    case 'openai':
      return createOpenAIProvider(config)
    default:
      throw new Error(`Unknown AI provider: ${opts.name}`)
  }
}

export type { AIProvider, ChatMessage, ChatRequest, ChatTool, ToolCall } from './types'
