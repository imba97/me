import type { AssistantMessage, ChatMessage, ChatTool, ToolCall, ToolMessage } from '~~/shared/ai/chat'
import { destr } from 'destr'
import { createParser } from 'eventsource-parser'

interface UseAiSessionOptions {
  tools: ChatTool[]
  executeCall: (name: string, args: Record<string, unknown>) => Promise<unknown>
  maxRounds?: number
  endpoint?: string
}

interface StreamChunk {
  toolCalls: ToolCall[]
}

const TOOL_RESULT_MAX_CHARS = 4000
const BAD_ARGS_MARKER = '__invalid_args__'

function truncateToolResult(s: string): string {
  if (s.length <= TOOL_RESULT_MAX_CHARS)
    return s
  return `${s.slice(0, TOOL_RESULT_MAX_CHARS)}\n\n[... 已截断，原始长度 ${s.length} 字符]`
}

function nextId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useAiSession(opts: UseAiSessionOptions) {
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const endpoint = opts.endpoint ?? '/api/ai'
  const maxRounds = opts.maxRounds ?? 5
  let abortController = new AbortController()

  function pushMsg<M extends ChatMessage>(msg: Omit<M, 'id'>): M {
    const created = { id: nextId(), ...msg } as M
    messages.value.push(created)
    // 返回 reactive Proxy：后续 content/toolCalls 的就地修改才会触发响应式
    return messages.value[messages.value.length - 1] as M
  }

  async function streamOnce(onContent: (delta: string) => void): Promise<StreamChunk> {
    const outbound = messages.value.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.role === 'assistant' && m.toolCalls ? { tool_calls: m.toolCalls } : {}),
      ...(m.role === 'tool'
        ? {
            tool_call_id: m.toolCallId,
            ...(m.name ? { name: m.name } : {})
          }
        : {})
    }))

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: outbound, tools: opts.tools }),
      signal: abortController.signal
    })

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '')
      throw new Error(`AI request failed ${res.status}: ${text.slice(0, 200)}`)
    }

    const toolAcc = new Map<number, { id?: string, name?: string, args: string }>()

    const parser = createParser({
      onEvent(event) {
        if (event.data === '[DONE]' || !event.data)
          return
        const json = destr<any>(event.data)
        const delta = json?.choices?.[0]?.delta
        if (!delta)
          return

        if (typeof delta.content === 'string' && delta.content.length > 0) {
          onContent(delta.content)
        }
        if (Array.isArray(delta.tool_calls)) {
          for (const t of delta.tool_calls) {
            const cur = toolAcc.get(t.index) ?? { args: '' }
            if (t.id)
              cur.id = t.id
            if (t.function?.name)
              cur.name = t.function.name
            if (typeof t.function?.arguments === 'string')
              cur.args += t.function.arguments
            toolAcc.set(t.index, cur)
          }
        }
      }
    })

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done)
        break
      parser.feed(value)
    }

    const toolCalls: ToolCall[] = []
    for (const acc of toolAcc.values()) {
      if (!acc.name)
        continue
      let args: Record<string, unknown> = {}
      let argsValid = true
      if (acc.args) {
        try {
          args = JSON.parse(acc.args)
        }
        catch {
          argsValid = false
          args = { [BAD_ARGS_MARKER]: acc.args.slice(0, 500) }
        }
      }
      if (!argsValid || typeof args !== 'object' || args === null) {
        args = { [BAD_ARGS_MARKER]: acc.args.slice(0, 500) }
      }
      toolCalls.push({
        id: acc.id ?? `call_${nextId()}`,
        name: acc.name,
        args
      })
    }
    return { toolCalls }
  }

  async function runRounds(): Promise<void> {
    for (let i = 0; i < maxRounds; i++) {
      const aiMsg = pushMsg<AssistantMessage>({ role: 'assistant', content: '' })
      const { toolCalls } = await streamOnce((delta) => {
        aiMsg.content += delta
      })

      if (toolCalls.length === 0)
        return

      aiMsg.toolCalls = toolCalls

      const results = await Promise.all(
        toolCalls.map(call => opts.executeCall(call.name, call.args))
      )
      toolCalls.forEach((call, idx) => {
        pushMsg<ToolMessage>({
          role: 'tool',
          toolCallId: call.id,
          name: call.name,
          content: truncateToolResult(JSON.stringify(results[idx]))
        })
      })
    }
    pushMsg({
      role: 'assistant',
      content: '[已达到最大工具调用次数，停止循环]'
    })
  }

  async function send(text: string): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed)
      return
    pushMsg({ role: 'user', content: trimmed })
    isStreaming.value = true
    error.value = null
    if (abortController.signal.aborted)
      abortController = new AbortController()
    try {
      await runRounds()
    }
    catch (err) {
      if (abortController.signal.aborted)
        return
      const msg = err instanceof Error ? err.message : String(err)
      error.value = msg
      const last = messages.value[messages.value.length - 1]
      if (last && last.role === 'assistant' && !last.content) {
        // `last` is the reactive Proxy; mutating through it triggers updates.
        last.content = `[错误: ${msg}]`
      }
    }
    finally {
      isStreaming.value = false
    }
  }

  function reset() {
    messages.value = []
    error.value = null
  }

  function cancel() {
    abortController.abort()
  }

  if (import.meta.client) {
    onScopeDispose(() => {
      abortController.abort()
    })
  }

  return { messages, isStreaming, error, send, reset, cancel }
}
