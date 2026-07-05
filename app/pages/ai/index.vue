<style scoped>
.ai-chat-container {
  position: relative;
  padding-bottom: env(safe-area-inset-bottom, 0);
  /* 禁止双指缩放 / 双击缩放，但允许滚动 */
  touch-action: pan-x pan-y;
  overscroll-behavior: contain;
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

.function-menu-row {
  /* 给 max-height 过渡一个明确目标：避免默认值 none，无法从 0 过渡；80px > 自然高度 80px */
  max-height: 80px;
}

.function-menu-enter-active,
.function-menu-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease, transform 0.25s ease;
  overflow: hidden;
}

.function-menu-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(100%);
}

.function-menu-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(100%);
}
</style>

<template>
  <div flex flex-col h-full bg-gray-100 class="ai-chat-container">
    <div ref="message-container" flex-1 p-4 overflow-auto class="message-container">
      <div max-w-3xl mx-auto space-y-4>
        <div v-show="visibleMessages.length === 0" text="4 center gray" space-y-4 pt-4>
          <p>求职偷懒 AI，精确获取我的简历信息</p>
          <!-- 平台相关文案避免 SSR/CSR 内容不一致导致的 hydration mismatch -->
          <ClientOnly>
            <p>{{ isMobileSize ? '按住输入框上滑添加图片' : '在输入框中粘贴图片' }}</p>
            <template #fallback>
              <p>在输入框中粘贴图片</p>
            </template>
          </ClientOnly>
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
          fixed right-6 z-20
          :style="{ bottom: jumpButtonBottom }"
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

    <div ref="input-container" border-t bg-white p-4 class="input-container">
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

        <!-- 功能菜单：按住输入框上滑触发；菜单里点图标才真正打开 picker。
             picker 通过按钮 @click 触发，每次都在新 user-activation 上下文里。 -->
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

      <!-- 功能菜单：流式贴在 input 行下方，按住上滑唤起，整体上移出现。
           v-if 切换 + max-height 过渡，整个 input-container 自然撑高把内容往上推。 -->
      <Transition name="function-menu">
        <div
          v-if="functionMenuOpen"
          class="function-menu-row"
        >
          <div max-w-3xl mx-auto px-4 py-2 flex items-center justify-start gap-1>
            <button
              type="button"
              aria-label="添加图片"
              class="size-12 flex items-center justify-center rounded-lg text-gray-600 select-none hover:bg-gray-50 active:bg-gray-100 transition-colors"
              @click="triggerImagePicker"
            >
              <div class="i-carbon-image text-2xl" />
            </button>
          </div>
        </div>
      </Transition>
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

// 禁止移动端双指缩放 / 双击缩放
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover'
    }
  ]
})

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

// vueuse 没有直接的 isMobile；项目里以 670px 为断点（与 Status 组件复用同一规则）
const { isMobileSize } = useMobileSize()

// 图片粘贴 / 双击退格删除
const {
  pendingImage,
  pendingImageUrl,
  imageError,
  previewOpen,
  imageDeletePrimed,
  handleKeydown: handleInputKeydown,
  deleteImage: deletePendingImage,
  pickFromFile
} = usePendingImage(inputRef, userInput)

// 菜单所在的容器：click-outside 判定的"外"= 这个容器之外
const inputContainerRef = useTemplateRef<HTMLElement>('input-container')

// 移动端：按住输入框上滑唤出功能菜单。菜单本身是普通 UI（不碰 picker 激活），
// 具体功能由菜单里的图标按钮点开 — 按钮 @click 是新 user-activation 上下文，
// 所以 picker 不会受 picker dialog 关掉后 transient activation TTL 损坏影响。
const { menuOpen: functionMenuOpen, close: closeFunctionMenu } = useSwipeUpMenu({
  origin: inputRef,
  isMobile: isMobileSize,
  containerRef: inputContainerRef
})

// 跟踪输入区高度（含菜单）。菜单展开时 input-container 自然撑高，跳转按钮跟着上移
// 用 useElementBounding 而非 useElementSize —— 后者 v14 签名是 (target, initialSize, options)，
// 想要 border-box 必须放第三个参数；bounding rect 天然包含 border，更直接
const { height: inputAreaHeight } = useElementBounding(inputContainerRef)
const jumpButtonBottom = computed(() =>
  inputAreaHeight.value > 0
    ? `calc(${inputAreaHeight.value}px + 0.5rem)`
    : '5rem'
)

// 系统选图：菜单里的"图片"按钮 → closeFunctionMenu → 走 picker。
// 用专用 hook 把 fresh input + 取消兜底 + 卸载清理集中在一处
const { trigger: triggerPicker } = useFilePicker({
  accept: 'image/*',
  onFile: pickFromFile
})

function triggerImagePicker() {
  closeFunctionMenu()
  triggerPicker()
}

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
