import type { AssistantMessage, ChatImage, ChatMessage, ChatTool, ToolCall, ToolMessage, UserMessage } from '~~/shared/ai/chat'
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

/** 网络层错误：fetch 自身抛 TypeError（断网、DNS、CORS 等），与 HTTP 状态无关。 */
class AiNetworkError extends Error {
  readonly isNetwork = true
}

/** 上游 HTTP 错误：服务端返回非 2xx。携带状态码与原始响应体（最多 200 字符，避免 message 过大）。 */
class AiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly rawBody: string
  ) {
    super(`AI request failed ${status}: ${rawBody.slice(0, 200)}`)
  }
}

/**
 * 把上游错误压成一句用户能看的中文。结构化错误按 instanceof 分支，
 * 比之前 regex 抓 `AI request failed NNN` 字符串稳定 —— throw 点改了不影响。
 */
function cleanError(err: unknown): string {
  if (err instanceof AiNetworkError)
    return '网络错误，请检查连接后重试'
  if (err instanceof AiRequestError) {
    if (err.status >= 500)
      return '服务暂时不可用，请稍后重试'
    if (err.status === 429)
      return '请求过于频繁，请稍后重试'
    if (err.status === 401 || err.status === 403)
      return '认证失败，请稍后重试'
    return '请求失败，请稍后重试'
  }
  return '请求失败，请稍后重试'
}

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
    const lastUserIdx = messages.value.map(m => m.role).lastIndexOf('user')
    const outbound = messages.value.map((m, i) => ({
      role: m.role,
      content: m.content,
      ...(m.role === 'assistant' && m.toolCalls ? { tool_calls: m.toolCalls } : {}),
      // 只有最新一条 user 消息携带图片，历史轮不再带（规则：上下文不持续带图）
      ...(m.role === 'user' && m.image && i === lastUserIdx ? { image: m.image } : {}),
      ...(m.role === 'tool'
        ? {
            tool_call_id: m.toolCallId,
            ...(m.name ? { name: m.name } : {})
          }
        : {})
    }))

    let res: Response
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: outbound, tools: opts.tools }),
        signal
      })
    }
    catch (err) {
      // fetch 自身抛错（断网、DNS、TLS）一律是 TypeError；其他异常原样上抛
      if (err instanceof TypeError)
        throw new AiNetworkError(err.message)
      throw err
    }

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '')
      throw new AiRequestError(res.status, text)
    }

    const toolAcc = new Map<number, { id?: string, name?: string, args: string }>()
    // 单帧内累积的待 yield 文本增量。`createParser.onEvent` 同步回调 → 用 buffer 桥接到 async generator。
    let pending: string[] = []

    const parser = createParser({
      onEvent(event) {
        if (event.data === '[DONE]' || !event.data)
          return
        const json = destr<any>(event.data)
        const delta = json?.choices?.[0]?.delta
        if (!delta)
          return

        if (typeof delta.content === 'string' && delta.content.length > 0)
          pending.push(delta.content)

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
        // 一次 drain 当前帧累积的 deltas：swap 引用而非逐个 shift，避免 O(n²)
        if (pending.length > 0) {
          const deltas = pending
          pending = []
          for (const d of deltas)
            yield d
        }
      }
    }
    finally {
      // 异常/中断/提前结束都释放底层流，不依赖 GC
      reader.cancel().catch(() => {})
    }

    return assembleToolCalls(toolAcc)
  }

  /** agentic 循环：流式渲染 → 执行工具 → 回填结果 → 继续，直到无工具调用或达上限。 */
  async function runRounds(signal: AbortSignal, reuse?: AssistantMessage): Promise<void> {
    // 重试时复用同一个 aiMsg，让「同一个气泡再次进入 loading」成立（id 不变 → :key 不变）。
    // 只在第一轮复用，后续轮还是 push 新消息。
    let firstAiMsg = reuse
    for (let i = 0; i < maxRounds; i++) {
      const aiMsg = firstAiMsg ?? pushMsg<AssistantMessage>({ role: 'assistant', content: '' })
      firstAiMsg = undefined

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
  function startRun(reuse?: AssistantMessage): Run {
    const controller = new AbortController()
    const signal = controller.signal

    const done = (async () => {
      status.value = 'streaming'
      try {
        await runRounds(signal, reuse)
      }
      catch (err) {
        if (signal.aborted)
          return
        // 把可能存在的部分流式内容丢掉 —— 错误状态下气泡只显示错误 UI
        const last = lastAssistant()
        if (last) {
          last.content = ''
          last.error = cleanError(err)
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
   * 重试最近一次失败的助手回答：清空同一个气泡的 content / error / aborted，
   * 把它的引用传给下一轮 runRounds 复用 —— 这样 :key 稳定，气泡不会闪退重建。
   * 复用前 content='' 的 assistant 消息会被 anthropic-protocol 跳过（无 text / 无 tool_use），
   * 所以服务端拿到的上下文等价于「从失败前那一轮继续」。
   */
  async function retry(): Promise<void> {
    if (status.value !== 'idle')
      return
    const last = lastAssistant()
    if (!last?.error)
      return

    last.content = ''
    last.error = undefined
    last.aborted = undefined

    current = startRun(last)
    await current.done
  }

  /**
   * 发送一条新消息。若正在流式，先打断当前运行并等其结算，再开新运行——
   * 于是「新消息打断」是主路径，而非特例。
   */
  async function send(text: string, image?: ChatImage): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed && !image)
      return

    interrupt()
    await current?.done

    pushMsg<UserMessage>({ role: 'user', content: trimmed, ...(image ? { image } : {}) })
    current = startRun()
    await current.done
  }

  if (import.meta.client) {
    onScopeDispose(() => {
      current?.abort()
    })
  }

  const isStreaming = computed(() => status.value === 'streaming')

  return { messages, status, isStreaming, send, interrupt, retry }
}
