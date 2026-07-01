import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event)
  const { aiApiUrl, aiApiKey, aiProvider, aiModel, aiMaxTokens, githubAccessToken }
    = useRuntimeConfig()

  if (!aiApiUrl || !aiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing AI API configuration'
    })
  }

  if (!message?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required'
    })
  }

  let systemPrompt: string

  try {
    systemPrompt = await getAiSystemPrompt(githubAccessToken)
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Failed to load system prompt'
    throw createError({
      statusCode: 500,
      statusMessage: errMsg
    })
  }

  const provider = createAiProvider({
    name: aiProvider as 'openai' | 'anthropic' | undefined,
    baseUrl: aiApiUrl,
    apiKey: aiApiKey,
    model: aiModel,
    maxTokens: aiMaxTokens
  })

  const response = await provider.chat({
    systemPrompt,
    messages: [{ role: 'user', content: message }]
  })

  if (!response.ok) {
    const error = await response.text()
    throw createError({
      statusCode: response.status,
      statusMessage: `AI API error: ${error}`
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  return response.body
})
