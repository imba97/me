import type { AiProtocol, ChatMessage, ChatRequest, ProviderConfig } from './types'
import { createParser } from 'eventsource-parser'
import { SSE_HEADERS, toolInputSchema, upstreamErrorResponse } from './response'
import { stripTrailingSlash } from './url'

/**
 * Anthropic-compatible messages provider.
 * Translates the native Anthropic streaming protocol into OpenAI-style SSE
 * so the rest of the pipeline is provider-agnostic.
 */

export function createAnthropicProtocol(opts: ProviderConfig): AiProtocol {
  const { baseUrl, apiKey, model, maxTokens = 4096 } = opts

  return {
    name: 'anthropic',

    async chat(req: ChatRequest, signal?: AbortSignal): Promise<Response> {
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
          ...(opts.thinking ? { thinking: { type: 'enabled' } } : { thinking: { type: 'disabled' } }),
          ...(req.tools && req.tools.length > 0
            ? { tools: toAnthropicTools(req.tools) }
            : {}),
          messages: toAnthropicMessages(req.messages)
        }),
        signal
      })

      if (!upstream.ok || !upstream.body) {
        return await upstreamErrorResponse(upstream)
      }

      return pipeAnthropicToOpenAI(upstream, model)
    }
  }
}

function toAnthropicTools(tools: NonNullable<ChatRequest['tools']>): any[] {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: toolInputSchema(t)
  }))
}

function toAnthropicMessages(messages: ChatMessage[]): any[] {
  const out: any[] = []

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]!

    if (m.role === 'user') {
      const blocks: any[] = []
      // 图片在文本之前（Anthropic 推荐顺序，也对应 UI 中图在上）
      if (m.image) {
        blocks.push({
          type: 'image',
          source: { type: 'base64', media_type: m.image.mediaType, data: m.image.data }
        })
      }
      blocks.push({ type: 'text', text: m.content })
      out.push({ role: 'user', content: blocks })
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

function pipeAnthropicToOpenAI(upstream: Response, model: string): Response {
  const encoder = new TextEncoder()
  const id = `chatcmpl-${Date.now()}`
  const created = Math.floor(Date.now() / 1000)
  const state = { sentRole: false, doneEmitted: false }
  const reader = upstream.body!.pipeThrough(new TextDecoderStream()).getReader()

  const stream = new ReadableStream({
    async start(controller) {
      const send = makeSseChunkSender(encoder, controller, state, id, created, model)
      const parser = createParser({
        onEvent: makeAnthropicEventHandler(send)
      })

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done)
            break
          parser.feed(value)
        }
        emitDone(encoder, controller, state)
        controller.close()
      }
      catch (err) {
        controller.error(err)
      }
    },
    // 下游取消（客户端断开）时取消上游读取，避免继续消费上游 token。
    cancel(reason) {
      reader.cancel(reason).catch(() => {})
    }
  })

  return new Response(stream, {
    status: 200,
    headers: SSE_HEADERS
  })
}

/** Build the SSE chunk payload and enqueue it. */
function makeSseChunkSender(
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController<Uint8Array>,
  state: { sentRole: boolean, doneEmitted: boolean },
  id: string,
  created: number,
  model: string
) {
  return (delta: any, finishReason: string | null) => {
    if (!state.sentRole && delta.role === undefined) {
      delta.role = 'assistant'
      state.sentRole = true
    }
    const chunk = {
      id,
      object: 'chat.completion.chunk',
      created,
      model,
      choices: [{ index: 0, delta, finish_reason: finishReason }]
    }
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
  }
}

function emitDone(
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController<Uint8Array>,
  state: { doneEmitted: boolean }
) {
  if (state.doneEmitted)
    return
  state.doneEmitted = true
  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
}

/** Map Anthropic stop_reason to OpenAI finish_reason. */
function finishReasonFromStop(stop: string): 'tool_calls' | 'length' | 'stop' {
  if (stop === 'tool_use')
    return 'tool_calls'
  if (stop === 'max_tokens')
    return 'length'
  return 'stop'
}

/** Translate Anthropic stream events into OpenAI-style chunks via `send`. */
function makeAnthropicEventHandler(
  send: (delta: any, finishReason: string | null) => void
) {
  return (event: { data: string }) => {
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
          send({
            tool_calls: [{
              index: evt.index,
              id: block.id,
              type: 'function',
              function: { name: block.name, arguments: '' }
            }]
          }, null)
        }
        break
      }
      case 'content_block_delta': {
        const d = evt.delta
        if (d?.type === 'text_delta') {
          send({ content: d.text ?? '' }, null)
        }
        else if (d?.type === 'input_json_delta') {
          send({
            tool_calls: [{
              index: evt.index,
              function: { arguments: d.partial_json ?? '' }
            }]
          }, null)
        }
        break
      }
      case 'message_delta': {
        const stop = evt.delta?.stop_reason
        if (stop)
          send({}, finishReasonFromStop(stop))
        break
      }
      case 'message_stop':
        // no-op; emitDone called by stream consumer
        break
    }
  }
}
