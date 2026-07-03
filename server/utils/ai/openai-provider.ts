import type { AIProvider, ChatMessage, ChatRequest, ChatTool, ProviderConfig } from './types'
import { SSE_HEADERS, toolInputSchema, upstreamErrorResponse } from './response'
import { stripTrailingSlash } from './url'

/**
 * OpenAI-compatible chat/completions provider.
 * OpenAI's upstream response is already OpenAI-style SSE, so the body passes through verbatim.
 */

export function createOpenAIProvider(opts: ProviderConfig): AIProvider {
  const { baseUrl, apiKey, model, maxTokens } = opts

  return {
    name: 'openai',

    async chat(req: ChatRequest, signal?: AbortSignal): Promise<Response> {
      const upstream = await fetch(`${stripTrailingSlash(baseUrl)}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
          stream: true,
          messages: [
            { role: 'system', content: req.systemPrompt },
            ...req.messages.map(toOpenAIMessage)
          ],
          ...(req.tools && req.tools.length > 0
            ? { tools: req.tools.map(toOpenAITool) }
            : {})
        }),
        signal
      })

      if (!upstream.ok || !upstream.body) {
        return await upstreamErrorResponse(upstream)
      }

      return new Response(upstream.body, {
        status: 200,
        headers: SSE_HEADERS
      })
    }
  }
}

function toOpenAITool(t: ChatTool) {
  return {
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: toolInputSchema(t)
    }
  }
}

function toOpenAIMessage(m: ChatMessage) {
  if (m.role === 'tool') {
    return {
      role: 'tool' as const,
      tool_call_id: m.toolCallId,
      content: m.content,
      ...(m.name ? { name: m.name } : {})
    }
  }
  if (m.role === 'assistant') {
    return {
      role: 'assistant' as const,
      content: m.content,
      ...(m.toolCalls && m.toolCalls.length > 0
        ? {
            tool_calls: m.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: {
                name: tc.name,
                arguments: JSON.stringify(tc.args ?? {})
              }
            }))
          }
        : {})
    }
  }
  return { role: 'user' as const, content: m.content }
}
