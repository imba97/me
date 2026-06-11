import { destr } from 'destr'
import { createParser } from 'eventsource-parser'

interface AIResponse {
  choices: {
    delta: {
      content?: string
    }
  }[]
}

export function useAiChat() {
  async function streamMessage(
    message: string,
    onDelta: (text: string) => void
  ): Promise<void> {
    const response = await $fetch<ReadableStream>('/api/ai', {
      method: 'POST',
      body: { message },
      responseType: 'stream'
    })

    const parser = createParser({
      onEvent(event) {
        if (event.data === '[DONE]' || !event.data) {
          return
        }

        const json = destr<AIResponse>(event.data)

        if (!json?.choices) {
          return
        }

        const delta = _map(json.choices, choice => _get(choice, 'delta.content', '')).join('')

        if (delta) {
          onDelta(delta)
        }
      }
    })

    const reader = response.pipeThrough(new TextDecoderStream()).getReader()

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      parser.feed(value)
    }
  }

  return { streamMessage }
}
