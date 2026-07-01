import type { ChatTool } from '~~/shared/ai/chat'
import type { AiToolRegistry, ToolProvider } from './types'

interface Route {
  provider: ToolProvider
  localName: string
}

/**
 * Aggregates tool definitions across providers with namespacing, and routes
 * `execute()` calls to the right provider.
 *
 * Example: provider `github` with local tool `list_repos` is exposed to the LLM
 * as `github_list_repos`.
 */
export function createToolRegistry(providers: ReadonlyArray<ToolProvider>): AiToolRegistry {
  const tools: ChatTool[] = []
  const routes = new Map<string, Route>()

  for (const p of providers) {
    for (const { localName, tool } of p.tools) {
      const namespaced = `${p.name}_${localName}`
      if (routes.has(namespaced)) {
        throw new Error(`Duplicate tool name: ${namespaced}`)
      }
      routes.set(namespaced, { provider: p, localName })
      tools.push({ ...tool, name: namespaced })
    }
  }

  return {
    listTools: () => tools,
    async execute(namespacedName, args) {
      const route = routes.get(namespacedName)
      if (!route) {
        return { ok: false, error: `Unknown tool: ${namespacedName}` }
      }
      try {
        const data = await route.provider.execute(route.localName, args)
        return { ok: true, data }
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { ok: false, error: message }
      }
    }
  }
}
