import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event)
  const { aiApiUrl, aiApiKey, githubAccessToken } = useRuntimeConfig()

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
    const message = error instanceof Error ? error.message : 'Failed to load system prompt'
    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  }

  const response = await fetch(`${aiApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiApiKey}`
    },
    body: JSON.stringify({
      model: 'MiniMax-M3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: true,
      thinking: { type: 'disabled' }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw createError({
      statusCode: response.status,
      statusMessage: `AI API error: ${error}`
    })
  }

  if (!response.body) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AI API returned empty response body'
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  return response.body
})
