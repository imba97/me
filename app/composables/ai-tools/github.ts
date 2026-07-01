import type { ChatTool } from '~~/shared/ai/chat'
import { createHttpToolProvider } from './http-provider'

const listReposTool: ChatTool = {
  name: 'list_repos',
  description: 'List the user\'s own GitHub repositories (personal repos plus organization repos the user has admin permission on, i.e., repos they created or own) sorted by most recently pushed. Excludes forks and repos where the user is only a regular collaborator. Returns the 30 most recently pushed repos with name, full name, description, and language. Use this when the user asks what projects they have, wants a portfolio overview, or wants to find a specific recent project.',
  parameters: { type: 'object', properties: {} }
}

const getRepoTool: ChatTool = {
  name: 'get_repo',
  description: 'Get detailed information and the README for a specific GitHub repository. Use this when the user asks to introduce, explain, or describe a particular project. The `name` parameter can be a bare repo name (the user\'s own) or `owner/repo` for any public repo.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Repository name (e.g., "my-repo") or "owner/repo" for any repo'
      }
    },
    required: ['name']
  }
}

export function createGitHubToolProvider() {
  return createHttpToolProvider({
    name: 'github',
    tools: [
      { localName: 'list_repos', tool: listReposTool },
      { localName: 'get_repo', tool: getRepoTool }
    ]
  })
}
