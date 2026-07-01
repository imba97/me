import type { ChatTool } from '~~/shared/ai/chat'

/**
 * A tool provider owns a set of related tools and executes them on demand.
 * The registry namespaces each tool as `${provider.name}_${tool.localName}`
 * so different providers can expose similarly-named tools without collision.
 */
export interface ToolProvider {
  readonly name: string
  readonly tools: ReadonlyArray<{ localName: string, tool: ChatTool }>
  execute: (localName: string, args: Record<string, unknown>) => Promise<unknown>
}

export interface AiToolRegistry {
  listTools: () => ChatTool[]
  execute: (namespacedName: string, args: Record<string, unknown>) => Promise<unknown>
}
