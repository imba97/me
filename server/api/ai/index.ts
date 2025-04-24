import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event)
  const runtimeConfig = useRuntimeConfig()

  const apiUrl = runtimeConfig.env.ONE_API_URL
  const apiKey = runtimeConfig.env.ONE_API_KEY

  if (!apiUrl || !apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing API configuration'
    })
  }

  try {
    // 调用 OpenAI API (流式响应)
    const response = await fetch(`${apiUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw createError({
        statusCode: response.status,
        statusMessage: `OpenAI API错误: ${error}`
      })
    }

    // 设置响应头，指定为事件流
    setResponseHeader(event, 'Content-Type', 'text/event-stream')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    setResponseHeader(event, 'Connection', 'keep-alive')

    // 创建流
    const stream = new ReadableStream({
      async start(controller) {
        // 确保响应body是可读流
        if (!response.body) {
          controller.close()
          return
        }

        const reader = response.body.getReader()

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            controller.close()
            break
          }

          controller.enqueue(value)
        }
      }
    })

    return stream
  }
  catch (error: any) {
    console.error('API调用错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `服务器错误: ${error.message || '未知错误'}`
    })
  }
})
