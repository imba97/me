<style scoped>
.ai-chat-container {
  position: relative;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.input-container {
  position: sticky;
  bottom: 0;
  width: 100%;
  z-index: 10;
}
</style>

<template>
  <div flex flex-col h-full bg-gray-100 class="ai-chat-container">
    <div ref="messageContainerRef" flex-1 p-4 overflow-auto class="message-container">
      <div max-w-3xl mx-auto space-y-4>
        <div v-show="messages.length === 0" text="4 center gray" space-y-4 pt-4>
          <p>求职偷懒 AI 🤣</p>
          <p>您可以输入<span font-bold px-1>想要了解的问题</span>或<span font-bold px-1>招聘要求</span>等</p>
        </div>

        <template v-for="(msg, index) in messages" :key="index">
          <!-- AI 消息 -->
          <MessageBubble
            v-if="msg.type === MessageType.AI"
            position="left"
            bg-class="bg-white"
          >
            <template #avatar>
              <img :src="avatar" alt="avatar" size-full>
            </template>

            <template v-if="msg.content.length > 0">
              {{ msg.content }}
            </template>
            <template v-else>
              <div i-line-md-loading-loop />
            </template>
          </MessageBubble>

          <!-- 用户消息 -->
          <MessageBubble
            v-else
            position="right"
            bg-class="bg-blue-500 text-white"
            avatar-class="bg-gray-300 text-gray-700"
          >
            <template #avatar>
              我
            </template>
            {{ msg.content }}
          </MessageBubble>
        </template>
      </div>
    </div>

    <div border-t bg-white p-4 class="input-container">
      <div max-w-3xl mx-auto flex>
        <input
          v-model="userInput"
          type="text"
          placeholder="输入消息..."
          flex-1 border rounded-l-lg px-4 py-2 outline-none focus="ring-2 ring-blue-500"
          @keyup.enter="sendMessage"
          @focus="onInputFocus"
          @blur="onInputBlur"
        >
        <button
          bg-blue-500 text-white px-4 py-2 rounded-r-lg hover="bg-blue-600"
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useScroll } from '@vueuse/core'
import { destr } from 'destr'
import { createParser } from 'eventsource-parser'

enum MessageType {
  AI,
  USER
}

interface Message {
  type: MessageType
  content: Ref<string> | string
  id?: string
}

interface AIResponse {
  choices: {
    delta: {
      content: string
    }
  }[]
}

// 使用 ref 创建响应式数据，便于后续流式更新
const messages = ref<Message[]>([])
const messageContainerRef = ref<HTMLElement | null>(null)

// 使用 useScroll 来监听滚动状态
const { arrivedState } = useScroll(messageContainerRef)

// 根据 arrivedState.bottom 判断是否在底部
const isAtBottom = computed(() => arrivedState.bottom)

const avatar = ref('')

const userInput = ref('')

// 滚动到底部的函数
function scrollToBottom() {
  if (messageContainerRef.value) {
    messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
  }
}

// 智能滚动：仅在用户处于底部时滚动
function smartScrollToBottom() {
  if (isAtBottom.value) {
    scrollToBottom()
  }
}

onMounted(() => {
  useLoadImage('/favicon.png', 10000)
    .then((image: string) => {
      avatar.value = image
    })
})

// 监听消息变化，自动滚动到底部
watch(() => [...messages.value], () => {
  nextTick(() => {
    smartScrollToBottom()
  })
}, { deep: true })

// 输入框焦点管理
const isKeyboardVisible = ref(false)

function onInputFocus() {
  isKeyboardVisible.value = true
  // 当输入法弹出时，滚动到底部
  setTimeout(() => {
    window.scrollTo(0, document.body.scrollHeight)
    scrollToBottom() // 这里保持强制滚动到底部，因为是用户操作
    // 不需要手动设置 isAtBottom，useScroll 会自动更新
  }, 300)
}

function onInputBlur() {
  isKeyboardVisible.value = false
}

// 使用 eventsource-parser 处理 SSE 流
async function sendMessage() {
  if (!userInput.value.trim())
    return

  // 添加用户消息
  const userMessage: Message = {
    type: MessageType.USER,
    content: userInput.value,
    id: Date.now().toString()
  }

  messages.value.push({
    ...userMessage,
    content: userMessage.content as string
  })

  userInput.value = ''

  await new Promise(resolve => setTimeout(resolve, 300))

  const aiMessage = {
    type: MessageType.AI,
    content: ref(''),
    id: Date.now().toString()
  }

  messages.value.push({
    ...aiMessage,
    content: aiMessage.content as any
  })

  // 添加消息后立即滚动到底部
  nextTick(() => {
    scrollToBottom() // 发送新消息时强制滚动到底部
  })

  const response = await $fetch<ReadableStream>('/api/ai', {
    method: 'POST',
    body: {
      message: userMessage.content
    },
    responseType: 'stream'
  })

  // 创建 SSE 解析器
  const parser = createParser({
    onEvent(event) {
      if (event.data === '[DONE]') {
        return
      }

      if (!event.data) {
        return
      }

      const json = destr<AIResponse>(event.data)

      if (!json) {
        return
      }

      aiMessage.content.value += _map(json.choices, choice => _get(choice, 'delta.content', '')).join('')

      // AI 回复内容更新时智能滚动到底部
      nextTick(() => {
        smartScrollToBottom()
      })
    }
  })

  // 读取流数据并传递给解析器
  const reader = response.pipeThrough(new TextDecoderStream()).getReader()

  while (true) {
    const { value, done } = await reader.read()

    if (done)
      break

    // 将接收到的数据块喂给解析器
    parser.feed(value)
  }
}
</script>
