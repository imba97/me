import type { ChatTool } from './types'

/**
 * Renders a compact system-prompt block describing the tools available in this request.
 * Prepended server-side so the LLM always sees an accurate tool list regardless of client.
 */
export function formatToolDescriptions(tools: ChatTool[]): string {
  if (tools.length === 0)
    return ''

  const lines = tools.map((t) => {
    const params = t.parameters && Object.keys(t.parameters).length > 0
      ? ` 参数: ${summarizeSchema(t.parameters)}`
      : ''
    return `- \`${t.name}\`: ${t.description}${params}`
  })

  return [
    '# 可用工具',
    '',
    '当用户问题与下列场景相关时，调用对应工具获取最新信息，不要凭记忆回答。',
    '可并行调用多个工具；工具结果会作为后续上下文。',
    '',
    ...lines
  ].join('\n')
}

function summarizeSchema(schema: Record<string, unknown>): string {
  const props = schema.properties as Record<string, { type?: string, description?: string }> | undefined
  const required = Array.isArray(schema.required) ? schema.required as string[] : []
  if (!props)
    return '(object)'

  return Object.entries(props)
    .map(([k, v]) => {
      const req = required.includes(k) ? '' : '?'
      return `${k}${req}: ${v.type ?? 'any'}`
    })
    .join(', ')
}
