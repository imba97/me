import type { AIProvider, ChatMessage, ChatRequest, ProviderConfig } from './types'
import { createParser } from 'eventsource-parser'
import { stripTrailingSlash } from './url'

/**
 * Anthropic-compatible messages provider.
 * Translates the native Anthropic streaming protocol into OpenAI-style SSE
 * so the rest of the pipeline is provider-agnostic.
 */

export function createAnthropicProvider(opts: ProviderConfig): AIProvider {
  const { baseUrl, apiKey, model, maxTokens = 4096 } = opts

  return {
    name: 'anthropic',

    async chat(req: ChatRequest): Promise<Response> {
      const upstream = await fetch(`${stripTrailingSlash(baseUrl)}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          stream: true,
          system: req.systemPrompt,
          thinking: { type: 'disabled' },
          ...(req.tools && req.tools.length > 0
            ? { tools: toAnthropicTools(req.tools) }
            : {}),
          messages: toAnthropicMessages(req.messages)
        })
      })

      if (!upstream.ok || !upstream.body) {
        const text = await upstream.text().catch(() => '')
        return new Response(
          JSON.stringify({
            error: `AI upstream error ${upstream.status}`,
            detail: text.slice(0, 1000)
          }),
          { status: upstream.status, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return anthropicToOpenAISSE(upstream, model)
    }
  }
}

function toAnthropicTools(tools: NonNullable<ChatRequest['tools']>): any[] {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema:
      t.parameters && Object.keys(t.parameters).length > 0
        ? t.parameters
        : { type: 'object', properties: {} }
  }))
}

function toAnthropicMessages(messages: ChatMessage[]): any[] {
  const out: any[] = []

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]!

    if (m.role === 'user') {
      out.push({ role: 'user', content: [{ type: 'text', text: m.content }] })
      continue
    }

    if (m.role === 'assistant') {
      const blocks: any[] = []
      if (m.content)
        blocks.push({ type: 'text', text: m.content })
      if (m.toolCalls && m.toolCalls.length > 0) {
        for (const tc of m.toolCalls) {
          blocks.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.name,
            input: tc.args ?? {}
          })
        }
      }
      if (blocks.length > 0)
        out.push({ role: 'assistant', content: blocks })
      continue
    }

    if (m.role === 'tool') {
      // Anthropic requires tool_result blocks inside a user message; coalesce consecutive tool messages.
      const toolResults: any[] = [
        {
          type: 'tool_result',
          tool_use_id: m.toolCallId,
          content: m.content
        }
      ]
      let j = i + 1
      while (j < messages.length && messages[j]?.role === 'tool') {
        const tm = messages[j] as Extract<ChatMessage, { role: 'tool' }>
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tm.toolCallId,
          content: tm.content
        })
        j++
      }
      out.push({ role: 'user', content: toolResults })
      i = j - 1
    }
  }

  return out
}

function anthropicToOpenAISSE(upstream: Response, model: string): Response {
  const encoder = new TextEncoder()
  const id = `chatcmpl-${Date.now()}`
  const created = Math.floor(Date.now() / 1000)
  const baseChoice = (delta: any, finishReason: string | null) => ({
    index: 0,
    delta,
    finish_reason: finishReason
  })
  let sentRole = false
  let doneEmitted = false

  const stream = new ReadableStream({
    async start(controller) {
      const emitDone = () => {
        if (doneEmitted)
          return
        doneEmitted = true
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      }

      try {
        const reader = upstream.body!.pipeThrough(new TextDecoderStream()).getReader()

        const send = (delta: any, finishReason: string | null) => {
          if (!sentRole && delta.role === undefined) {
            delta.role = 'assistant'
            sentRole = true
          }
          const chunk = {
            id,
            object: 'chat.completion.chunk',
            created,
            model,
            choices: [baseChoice(delta, finishReason)]
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
        }

        const parser = createParser({
          onEvent(event) {
            if (event.data === '[DONE]' || !event.data)
              return
            let evt: any
            try {
              evt = JSON.parse(event.data)
            }
            catch {
              return
            }

            switch (evt.type) {
              case 'content_block_start': {
                const block = evt.content_block
                if (block?.type === 'tool_use') {
                  send(
                    {
                      tool_calls: [
                        {
                          index: evt.index,
                          id: block.id,
                          type: 'function',
                          function: { name: block.name, arguments: '' }
                        }
                      ]
                    },
                    null
                  )
                }
                break
              }
              case 'content_block_delta': {
                const d = evt.delta
                if (d?.type === 'text_delta') {
                  send({ content: d.text ?? '' }, null)
                }
                else if (d?.type === 'input_json_delta') {
                  send(
                    {
                      tool_calls: [
                        {
                          index: evt.index,
                          function: { arguments: d.partial_json ?? '' }
                        }
                      ]
                    },
                    null
                  )
                }
                break
              }
              case 'message_delta': {
                const stop = evt.delta?.stop_reason
                if (stop) {
                  const finish
                    = stop === 'tool_use'
                      ? 'tool_calls'
                      : stop === 'max_tokens'
                        ? 'length'
                        : 'stop'
                  send({}, finish)
                }
                break
              }
              case 'message_stop': {
                emitDone()
                break
              }
            }
          }
        })

        while (true) {
          const { value, done } = await reader.read()
          if (done)
            break
          parser.feed(value)
        }
        emitDone()
        controller.close()
      }
      catch (err) {
        controller.error(err)
      }
    }
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  })
}
