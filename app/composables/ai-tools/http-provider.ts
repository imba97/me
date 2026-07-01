import type { ChatTool } from '~~/shared/ai/chat'
import type { ToolProvider } from './types'

/**
 * Generic provider that POSTs `{ localName, args }` to `/api/tools/{name}/{localName}`.
 * Each provider just declares its tool schemas; execution is uniform.
 */
export function createHttpToolProvider(config: {
  name: string
  tools: ReadonlyArray<{ localName: string, tool: ChatTool }>
}): ToolProvider {
  return {
    name: config.name,
    tools: config.tools,
    async execute(localName, args) {
      return await $fetch(`/api/tools/${config.name}/${localName.replace(/_/g, '-')}`, {
        method: 'POST',
        body: args
      })
    }
  }
}
