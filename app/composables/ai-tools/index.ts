import { createBilibiliToolProvider } from './bilibili'
import { createBlogToolProvider } from './blog'
import { createGitHubToolProvider } from './github'
import { createToolRegistry } from './registry'

/**
 * Singleton tool registry. Add new providers here as one-liners.
 */
export const aiTools = createToolRegistry([
  createGitHubToolProvider(),
  createBilibiliToolProvider(),
  createBlogToolProvider()
])
