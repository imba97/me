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

:deep(.markstream-vue) {
  --ms-flow-paragraph-y: 1em;
}

:deep(.markstream-vue > .node-slot:first-child .paragraph-node) {
  margin-top: 0;
}

:deep(.markstream-vue > .node-slot:last-child .paragraph-node) {
  margin-bottom: 0;
}
</style>

<template>
  <div flex flex-col h-full bg-gray-100 class="ai-chat-container">
    <div ref="message-container" flex-1 p-4 overflow-auto class="message-container">
      <div max-w-3xl mx-auto space-y-4>
        <div v-show="visibleMessages.length === 0" text="4 center gray" space-y-4 pt-4>
          <p>求职偷懒 AI，精确获取我的简历信息</p>
          <p>您可以输入<span font-bold px-1>想要了解的问题</span>或<span font-bold px-1>招聘要求</span>等</p>
        </div>

        <button
          v-show="showJumpButton"
          type="button"
          aria-label="回到底部"
          size-10 rounded-full bg-white shadow-lg border border-gray-200
          text-gray-600 hover="bg-gray-50 text-blue-500"
          transition-all duration-200
          flex items-center justify-center
          :class="{ 'animate-bounce': isStreaming }"
          fixed bottom-20 right-6 z-20
          @click="jumpToBottom"
        >
          <div i-carbon-arrow-down />
        </button>

        <template v-for="(msg, idx) in visibleMessages" :key="msg.id">
          <!-- AI 消息 -->
          <MessageBubble
            v-if="msg.role === 'assistant'"
            :ref="trackAssistantBubble"
            position="left"
            bg-class="bg-white"
          >
            <template #avatar>
              <NuxtImg src="/favicon.png" alt="avatar" size-full />
            </template>

            <template v-if="msg.content.length > 0">
              <MarkdownRender
                mode="chat"
                :content="msg.content"
                :final="!isStreaming || idx < visibleMessages.length - 1"
                smooth-streaming="auto"
                :fade="false"
                html-policy="escape"
              />
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
      <div max-w-3xl mx-auto flex relative>
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :animate="suggestionAnimateState"
          :transition="{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            mass: 1
          }"
          absolute bottom-full mb-4 left-0 w-full flex justify-end
          :style="{ pointerEvents: shouldShowSuggestion ? 'auto' : 'none' }"
        >
          <div
            bg-white px-4 py-2 rounded-full text-blue-500 border border-blue-200
            cursor-pointer hover="bg-blue-50" transition-colors shadow-sm
            @click="sendSuggestion"
          >
            {{ defaultInput }}
          </div>
        </motion.div>

        <input
          v-model="userInput"
          type="text"
          placeholder="输入消息..."
          flex-1 border rounded-l-lg px-4 py-2 outline-none focus="ring-2 ring-blue-500"
          :disabled="isStreaming"
          @keyup.enter="sendMessage"
          @focus="onInputFocus"
        >
        <button
          bg-blue-500 text-white px-4 py-2 rounded-r-lg hover="bg-blue-600"
          :disabled="isStreaming"
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEventListener, useResizeObserver } from '@vueuse/core'
import MarkdownRender from 'markstream-vue'
import { motion } from 'motion-v'

const BOTTOM_TOLERANCE = 4

const { messages, isStreaming, send } = useAiSession({
  tools: aiTools.listTools(),
  executeCall: aiTools.execute
})

const visibleMessages = computed(() => {
  const arr = messages.value
  const lastAssistantIdx = arr.map(m => m.role).lastIndexOf('assistant')
  return arr.filter((m, idx) => {
    if (m.role === 'tool')
      return false
    if (m.role === 'assistant' && m.content.length === 0 && idx !== lastAssistantIdx)
      return false
    return true
  })
})

const messageContainerRef = useTemplateRef('message-container')

const userInput = ref('')
const defaultInput = '做个自我介绍'
const showSuggestion = ref(false)

// 用户滚动意图：在底部 = false，滚上去 = true
// 直接由 scroll event 维护意图，不依赖 arrivedState（陈旧态）
let prevScrollTop = 0
const userScrolledUp = ref(false)
useEventListener(messageContainerRef, 'scroll', () => {
  const el = messageContainerRef.value
  if (!el)
    return
  const newScrollTop = el.scrollTop
  // 用户真往上滚了 → 标记；阈值过滤 scroll anchoring 之类的小幅抖动
  if (newScrollTop < prevScrollTop - BOTTOM_TOLERANCE)
    userScrolledUp.value = true
  // 回到（含容差的）底部 → 解除标记
  if (el.scrollHeight - el.clientHeight - newScrollTop <= BOTTOM_TOLERANCE)
    userScrolledUp.value = false
  prevScrollTop = newScrollTop
}, { passive: true })

const showJumpButton = computed(() => userScrolledUp.value)

// 跟踪最后一个 assistant 气泡的 DOM。v-for 里 :ref 回调每次 mount 都会调用，
// 最后一个写进来的就是当前正在流式的气泡。
const lastBubbleEl = ref<HTMLElement | null>(null)
function trackAssistantBubble(el: any) {
  if (el?.$el)
    lastBubbleEl.value = el.$el
}

// 只观察最后一个气泡的高度变化：SSE chunk 到达、markstream 后续动画都改它的高度。
// 用户在底部就跟到底。靠 userScrolledUp 判定意图，不查陈旧态。
useResizeObserver(lastBubbleEl, () => {
  if (userScrolledUp.value)
    return
  const container = messageContainerRef.value
  if (!container || container.scrollHeight <= container.clientHeight)
    return
  container.scrollTo({ top: container.scrollHeight, behavior: 'auto' })
})

const shouldShowSuggestion = computed(
  () => showSuggestion.value && !userInput.value.trim() && visibleMessages.value.length === 0
)

const suggestionAnimateState = computed(() => {
  return shouldShowSuggestion.value
    ? { opacity: 1, y: -10 }
    : { opacity: 0, y: 30 }
})

onMounted(() => {
  setTimeout(() => {
    showSuggestion.value = true
  }, 2000)
})

function scrollToBottom() {
  if (messageContainerRef.value) {
    messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
  }
}

function jumpToBottom() {
  if (!messageContainerRef.value)
    return
  // 即时跳，不走 smooth 动画：用户点按钮的瞬间就期望到位
  messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
}

function onInputFocus() {
  setTimeout(() => {
    window.scrollTo(0, document.body.scrollHeight)
    scrollToBottom()
  }, 300)
}

async function sendMessage() {
  if (!userInput.value.trim() || isStreaming.value)
    return

  const text = userInput.value
  userInput.value = ''

  await nextTick()
  scrollToBottom()

  await send(text)
}

function sendSuggestion() {
  userInput.value = defaultInput
  sendMessage()
}
</script>
