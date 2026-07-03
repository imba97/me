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

.image-prime-enter-active {
  transition: opacity 0.2s ease;
}

.image-prime-leave-active {
  transition: opacity 0.45s ease;
}

.image-prime-enter-from,
.image-prime-leave-to {
  opacity: 0;
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
            <div flex flex-col gap-2>
              <img
                v-if="msg.role === 'user' && msg.image"
                :src="chatImageToDataUrl(msg.image)"
                alt="图片"
                max-h-60 rounded object-contain
              >
              <div v-if="msg.content">
                {{ msg.content }}
              </div>
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
            {{ defaultText }}
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
            @keydown="handleInputKeydown"
            @keyup.enter="sendMessage"
            @focus="onInputFocus"
          >
          <div
            v-if="pendingImage"
            absolute right-2 size-8
            class="top-1/2 -translate-y-1/2"
          >
            <img
              :src="pendingImageUrl"
              alt="待发送图片"
              size-full rounded object-cover cursor-pointer
              @click="previewOpen = true"
            >
            <Transition name="image-prime">
              <div
                v-if="imageDeletePrimed"
                class="absolute inset-0 flex items-center justify-center bg-red-500/85 rounded pointer-events-none"
              >
                <div class="i-carbon-trash-can text-white text-lg" />
              </div>
            </Transition>
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
        @click.self="previewOpen = false"
      >
        <div class="relative">
          <img :src="pendingImageUrl" alt="图片预览" max-w-full max-h-full rounded object-contain>
          <div class="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              aria-label="删除图片"
              size-10 flex items-center justify-center rounded-full bg="black/50" text-white
              hover="bg-black/70" transition-colors
              @click="deletePendingImage"
            >
              <div class="i-carbon-trash-can text-lg" />
            </button>
            <button
              type="button"
              aria-label="关闭预览"
              size-10 flex items-center justify-center rounded-full bg="black/50" text-white
              hover="bg-black/70" transition-colors
              @click="previewOpen = false"
            >
              <div class="i-carbon-close text-lg" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import MarkdownRender from 'markstream-vue'
import { motion } from 'motion-v'
import { chatImageToDataUrl } from '~/utils/chat-image'

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

const userInput = ref('')

const inputRef = useTemplateRef<HTMLInputElement>('chat-input')
const messageContainerRef = useTemplateRef('message-container')

// 图片粘贴 / 双击退格删除
const {
  pendingImage,
  pendingImageUrl,
  imageError,
  previewOpen,
  imageDeletePrimed,
  handleKeydown: handleInputKeydown,
  deleteImage: deletePendingImage
} = usePendingImage(inputRef, userInput)

// 消息列表的自动滚动
const {
  showJumpButton,
  trackAssistantBubble,
  scrollToBottom,
  onInputFocus
} = useAutoScroll(messageContainerRef)

// 建议气泡（2s 后浮现，仅在空输入 + 没有任何消息时显示）
const { defaultText, shouldShowSuggestion, suggestionAnimateState, applySuggestion: sendSuggestion } = useSuggestionBanner({
  inputValue: userInput,
  isEmpty: computed(() => !userInput.value.trim()),
  noMessages: computed(() => visibleMessages.value.length === 0),
  defaultText: '做个自我介绍',
  onApply: sendMessage
})

async function sendMessage() {
  const image = pendingImage.value ?? undefined
  if (!userInput.value.trim() && !image)
    return

  const text = userInput.value
  userInput.value = ''
  deletePendingImage()

  await nextTick()
  scrollToBottom()

  await send(text, image)
}
</script>
