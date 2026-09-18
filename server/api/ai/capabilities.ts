import { createAiProvider } from '../../utils/ai/platform'

/**
 * Exposes the active AI provider's declared capabilities to the client.
 * `supportsImage` is model-aware and comes from the provider layer
 * (e.g. MiniMax supports images only on M3) — the client uses it to
 * decide whether to enable image paste.
 */
export default defineEventHandler(() => {
  const { aiApiUrl, aiApiKey, aiModel, aiMaxTokens, aiProvider } = useRuntimeConfig()

  if (!aiApiKey) {
    return { supportsImage: false }
  }

  try {
    const provider = createAiProvider(aiProvider, {
      baseUrl: aiApiUrl,
      apiKey: aiApiKey,
      model: aiModel,
      maxTokens: aiMaxTokens,
      contentTypes: new Set(['text', 'tool_use', 'tool_result', 'thinking', 'image', 'video'])
    })
    return { supportsImage: provider.capabilities.supportsImage }
  }
  catch {
    return { supportsImage: false }
  }
})
