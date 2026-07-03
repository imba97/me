import type { AssistantMessage, ChatMessage, ChatTool, ToolCall, ToolMessage } from '~~/shared/ai/chat'
import { destr } from 'destr'
import { createParser } from 'eventsource-parser'

interface UseAiSessionOptions {
  tools: ChatTool[]
  executeCall: (name: string, args: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>
  maxRounds?: number
  endpoint?: string
}

type SessionStatus = 'idle' | 'streaming'

/** 单次发送的运行句柄：独占一个 AbortController，`done` 永不 reject。 */
interface Run {
  readonly signal: AbortSignal
  readonly done: Promise<void>
  abort: () => void
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

/** 累积中的流式 tool_call 分片，收流时组装成完整 ToolCall。 */
function assembleToolCalls(acc: Map<number, { id?: string, name?: string, args: string }>): ToolCall[] {
  const toolCalls: ToolCall[] = []
  for (const cur of acc.values()) {
    if (!cur.name)
      continue
    let args: Record<string, unknown> = {}
    if (cur.args) {
      try {
        const parsed = JSON.parse(cur.args)
        args = typeof parsed === 'object' && parsed !== null
          ? parsed
          : { [BAD_ARGS_MARKER]: cur.args.slice(0, 500) }
      }
      catch {
        args = { [BAD_ARGS_MARKER]: cur.args.slice(0, 500) }
      }
    }
    toolCalls.push({ id: cur.id ?? `call_${nextId()}`, name: cur.name, args })
  }
  return toolCalls
}

export function useAiSession(opts: UseAiSessionOptions) {
  const messages = ref<ChatMessage[]>([])
  const status = ref<SessionStatus>('idle')
  const error = ref<string | null>(null)
  const endpoint = opts.endpoint ?? '/api/ai'
  const maxRounds = opts.maxRounds ?? 5

  let current: Run | null = null

  function pushMsg<M extends ChatMessage>(msg: Omit<M, 'id'>): M {
    const created = { id: nextId(), ...msg } as M
    messages.value.push(created)
    // 返回 reactive Proxy：后续 content/toolCalls 的就地修改才会触发响应式
    return messages.value[messages.value.length - 1] as M
  }

  /** 末尾若是 assistant 则返回它（reactive Proxy），否则 null。 */
  function lastAssistant(): AssistantMessage | null {
    const last = messages.value[messages.value.length - 1]
    return last?.role === 'assistant' ? last : null
  }

  /**
   * 传输层：一次上游请求。`yield` 文本增量，`return` 组装好的 tool calls。
   * 把 fetch + SSE 解析和上层 agentic 循环解耦。
   */
  async function* streamChat(signal: AbortSignal): AsyncGenerator<string, ToolCall[]> {
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
      signal
    })

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '')
      throw new Error(`AI request failed ${res.status}: ${text.slice(0, 200)}`)
    }

    const toolAcc = new Map<number, { id?: string, name?: string, args: string }>()
    const queue: string[] = []

    const parser = createParser({
      onEvent(event) {
        if (event.data === '[DONE]' || !event.data)
          return
        const json = destr<any>(event.data)
        const delta = json?.choices?.[0]?.delta
        if (!delta)
          return

        if (typeof delta.content === 'string' && delta.content.length > 0)
          queue.push(delta.content)

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
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done)
          break
        parser.feed(value)
        while (queue.length > 0)
          yield queue.shift()!
      }
    }
    finally {
      // 异常/中断/提前结束都释放底层流，不依赖 GC
      reader.cancel().catch(() => {})
    }

    return assembleToolCalls(toolAcc)
  }

  /** agentic 循环：流式渲染 → 执行工具 → 回填结果 → 继续，直到无工具调用或达上限。 */
  async function runRounds(signal: AbortSignal): Promise<void> {
    for (let i = 0; i < maxRounds; i++) {
      const aiMsg = pushMsg<AssistantMessage>({ role: 'assistant', content: '' })
      const stream = streamChat(signal)

      let step = await stream.next()
      while (!step.done) {
        aiMsg.content += step.value
        step = await stream.next()
      }
      const toolCalls = step.value

      if (toolCalls.length === 0)
        return

      aiMsg.toolCalls = toolCalls

      const results = await Promise.all(
        toolCalls.map(call => opts.executeCall(call.name, call.args, signal))
      )
      if (signal.aborted)
        return

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

  /** 启动一次自包含的运行，登记为 `current`，直到结算。 */
  function startRun(): Run {
    const controller = new AbortController()
    const signal = controller.signal

    const done = (async () => {
      status.value = 'streaming'
      error.value = null
      try {
        await runRounds(signal)
      }
      catch (err) {
        if (signal.aborted)
          return
        const msg = err instanceof Error ? err.message : String(err)
        error.value = msg
        const last = lastAssistant()
        if (last && !last.content) {
          // `last` 是 reactive Proxy，就地修改会触发更新
          last.content = `[错误: ${msg}]`
        }
      }
      finally {
        if (signal.aborted) {
          // 给被中断的那条 assistant 打标记：UI 用它把 loading 换成「已停止」
          const last = lastAssistant()
          if (last)
            last.aborted = true
        }
        if (current?.signal === signal) {
          current = null
          status.value = 'idle'
        }
      }
    })()

    return { signal, done, abort: () => controller.abort() }
  }

  /** 中断当前运行；空闲时是 no-op。 */
  function interrupt(): void {
    current?.abort()
  }

  /**
   * 发送一条新消息。若正在流式，先打断当前运行并等其结算，再开新运行——
   * 于是「新消息打断」是主路径，而非特例。
   */
  async function send(text: string): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed)
      return

    interrupt()
    await current?.done

    pushMsg({ role: 'user', content: trimmed })
    current = startRun()
    await current.done
  }

  if (import.meta.client) {
    onScopeDispose(() => {
      current?.abort()
    })
  }

  const isStreaming = computed(() => status.value === 'streaming')

  return { messages, status, isStreaming, error, send, interrupt }
}
