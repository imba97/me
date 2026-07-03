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
          @click="scrollToBottom"
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
              <div v-if="msg.aborted" mt-1 flex items-center gap-1 text="xs gray-400">
                <div i-carbon-stop-outline />
                <span>已停止</span>
              </div>
            </template>
            <template v-else-if="msg.aborted">
              <div flex items-center gap-1 text="sm gray-400">
                <div i-carbon-stop-outline />
                <span>已停止回答</span>
              </div>
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
            <img
              v-if="msg.role === 'user' && msg.image"
              :src="imageSrc(msg.image)"
              alt="图片"
              max-h-60 rounded mb-2 object-contain
            >
            <div v-if="msg.content">
              {{ msg.content }}
            </div>
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

        <div v-if="imageError" absolute bottom-full mb-2 left-0 text="xs red-500">
          {{ imageError }}
        </div>

        <div flex-1 relative>
          <input
            ref="chat-input"
            v-model="userInput"
            type="text"
            placeholder="输入消息..."
            w-full border rounded-l-lg px-4 py-2 outline-none focus="ring-2 ring-blue-500"
            :class="pendingImage ? 'pr-12' : ''"
            @keyup.enter="sendMessage"
            @focus="onInputFocus"
          >
          <div
            v-if="pendingImage"
            group absolute right-2 size-8
            class="top-1/2 -translate-y-1/2"
          >
            <img
              :src="pendingImageUrl"
              alt="待发送图片"
              size-full rounded object-cover cursor-pointer
              @click="previewOpen = true"
            >
            <button
              type="button"
              absolute size-4 items-center justify-center rounded-full bg-gray-700 text-white
              class="hidden group-hover:flex -right-1.5 -top-1.5"
              @click="pendingImage = null"
            >
              <div i-carbon-close class="text-[10px]" />
            </button>
          </div>
        </div>
        <button
          v-if="isStreaming"
          bg-gray-500 text-white px-4 py-2 rounded-r-lg hover="bg-gray-600"
          @click="interrupt"
        >
          停止
        </button>
        <button
          v-else
          bg-blue-500 text-white px-4 py-2 rounded-r-lg hover="bg-blue-600"
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="previewOpen"
        fixed inset-0 z-50 flex items-center justify-center bg="black/70" p-8
        @click="previewOpen = false"
      >
        <img :src="pendingImageUrl" alt="图片预览" max-w-full max-h-full rounded object-contain>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import type { ChatImage } from '~~/shared/ai/chat'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import MarkdownRender from 'markstream-vue'
import { motion } from 'motion-v'

const BOTTOM_TOLERANCE = 4
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_IMAGE_EDGE = 1568

const { messages, isStreaming, send, interrupt } = useAiSession({
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

// 图片粘贴：能力由服务端 AI provider 声明（provider.supportsImage）
const { data: aiCaps } = useFetch('/api/ai/capabilities')
const supportsImage = computed(() => aiCaps.value?.supportsImage ?? false)
const inputRef = useTemplateRef<HTMLInputElement>('chat-input')
const pendingImage = ref<ChatImage | null>(null)
const imageError = ref('')
const previewOpen = ref(false)
const pendingImageUrl = computed(() =>
  pendingImage.value ? imageSrc(pendingImage.value) : ''
)

// 预览打开时锁住 body 滚动，避免背景跟着滚
watch(previewOpen, (open) => {
  if (typeof document === 'undefined')
    return
  document.body.style.overflow = open ? 'hidden' : ''
})

function imageSrc(img: ChatImage): string {
  return `data:${img.mediaType};base64,${img.data}`
}

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
function trackAssistantBubble(el: unknown) {
  const node = (el as { $el?: HTMLElement } | null)?.$el
  if (node)
    lastBubbleEl.value = node
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
  if (!messageContainerRef.value)
    return
  // 即时跳：发送消息、点浮动按钮、聚焦输入框都期望瞬间到位
  messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
}

function onInputFocus() {
  // 现代浏览器聚焦 input 时会自动滚到可见区，无需手动 hack
  messageContainerRef.value?.scrollTo({ top: messageContainerRef.value.scrollHeight, behavior: 'smooth' })
}

async function sendMessage() {
  const image = pendingImage.value ?? undefined
  if (!userInput.value.trim() && !image)
    return

  const text = userInput.value
  userInput.value = ''
  pendingImage.value = null
  imageError.value = ''

  await nextTick()
  scrollToBottom()

  await send(text, image)
}

function sendSuggestion() {
  userInput.value = defaultInput
  sendMessage()
}

function stripBase64Prefix(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

async function fileToChatImage(file: File): Promise<ChatImage> {
  const mediaType = file.type

  // GIF 保留原图（保留动画帧）
  if (mediaType === 'image/gif') {
    const dataUrl = await readAsDataUrl(file)
    return { mediaType, data: stripBase64Prefix(dataUrl) }
  }

  // createImageBitmap 直接解码 File，跳过完整 base64 字符串这一中间态，
  // 内存峰值更低；对 4MB 截图可省约 4MB 同时驻留。
  const bitmap = await createImageBitmap(file)
  try {
    const longest = Math.max(bitmap.width, bitmap.height)
    if (longest <= MAX_IMAGE_EDGE) {
      // 不缩放：直接读原文件，避免 canvas 二次编码（JPEG 会有损）
      const dataUrl = await readAsDataUrl(file)
      return { mediaType, data: stripBase64Prefix(dataUrl) }
    }

    // 超长边：等比缩小到 MAX_IMAGE_EDGE
    const scale = MAX_IMAGE_EDGE / longest
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('canvas context unavailable')
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return { mediaType, data: stripBase64Prefix(canvas.toDataURL(mediaType)) }
  }
  finally {
    bitmap.close()
  }
}

async function onPaste(e: ClipboardEvent) {
  if (!supportsImage.value)
    return
  const items = e.clipboardData?.items
  if (!items)
    return
  const item = Array.from(items).find(it => it.kind === 'file' && it.type.startsWith('image/'))
  if (!item)
    return
  e.preventDefault()
  const file = item.getAsFile()
  if (!file)
    return
  // 图片是用户表达的一部分：无法采用时提示并中止，不静默降级
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    imageError.value = '仅支持 JPEG / PNG / GIF / WEBP 图片'
    return
  }
  if (file.size > MAX_IMAGE_BYTES) {
    imageError.value = '图片过大，请使用 4MB 以内的图片'
    return
  }
  try {
    // 多次粘贴替换上一张
    pendingImage.value = await fileToChatImage(file)
    imageError.value = ''
  }
  catch {
    imageError.value = '图片读取失败，请重试'
  }
}

// 粘贴监听始终注册，是否处理由 provider 能力决定（onPaste 内部判断）
useEventListener(inputRef, 'paste', onPaste)
</script>
