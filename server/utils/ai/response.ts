import type { ChatTool } from './types'

/** Standard SSE response headers shared by all providers. */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive'
} as const

/** Build a JSON error Response mirroring a failed upstream request. */
export async function upstreamErrorResponse(upstream: Response): Promise<Response> {
  const text = await upstream.text().catch(() => '')
  return new Response(
    JSON.stringify({
      error: `AI upstream error ${upstream.status}`,
      detail: text.slice(0, 1000)
    }),
    { status: upstream.status, headers: { 'Content-Type': 'application/json' } }
  )
}

/** A tool's JSON Schema parameters, falling back to an empty object schema. */
export function toolInputSchema(tool: ChatTool): Record<string, unknown> {
  return tool.parameters && Object.keys(tool.parameters).length > 0
    ? tool.parameters
    : { type: 'object', properties: {} }
}
