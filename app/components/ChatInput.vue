<style scoped>
.input-container {
  position: sticky;
  bottom: 0;
  width: 100%;
  z-index: 10;
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
  <div ref="chat-input-container" border-t bg-white p-4 class="input-container">
    <div max-w-3xl mx-auto flex relative>
      <!-- 建议气泡 -->
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

      <!-- 图片错误提示 -->
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
          @focus="onInputFocus?.()"
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
        @click="onInterrupt"
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

    <!-- 功能菜单：移动端按住输入框上滑唤起 -->
    <FunctionMenu :open="functionMenuOpen">
      <button
        type="button"
        aria-label="添加图片"
        class="size-12 flex items-center justify-center rounded-lg text-gray-600 select-none hover:bg-gray-50 active:bg-gray-100 transition-colors"
        @click="triggerImagePicker"
      >
        <div class="i-carbon-image text-2xl" />
      </button>
    </FunctionMenu>

    <!-- 待发送图全屏预览。Teleport 出去避免被 input-container 的 overflow 影响。 -->
    <ImagePreviewModal
      v-if="previewOpen"
      :src="pendingImageUrl"
      @close="previewOpen = false"
      @delete="deletePendingImage"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ChatImage } from '~~/shared/ai/chat'
import { motion } from 'motion-v'

/**
 * ChatInput：聚合聊天页面底部输入区的所有交互
 * - 文本输入与发送（isStreaming 切换 send / stop）
 * - 待发送图片缩略图 + 双击退格删除 / 点开预览
 * - 移动端按住输入框上滑唤起 FunctionMenu（当前只有"添加图片"）
 * - 输入框上方建议气泡（首次进入 + 输入为空 + 尚无消息时显示）
 * - 图片错误提示
 *
 * 数据流：
 * - 父组件通过 prop 告知：是否 streaming、是否还没有任何消息、input 焦点时的回调
 * - 子组件 emit 'send'（带 text / image）、'interrupt' 通知父组件具体动作
 * - 把根 DOM 的 ref 通过 defineExpose 暴露给父组件，让 JumpToBottomButton 跟随高度
 */

const props = defineProps<{
  /** 当前是否在 streaming —— 控制 send/stop 按钮切换 */
  isStreaming: boolean
  /** 消息列表为空 —— 让 useSuggestionBanner 决定是否显示建议气泡 */
  noMessages: boolean
  /** 输入 focus 时触发 —— 通常是从 useAutoScroll 来的滚动到底部逻辑 */
  onInputFocus?: () => void
}>()

const emit = defineEmits<{
  /** 用户发送消息；由父组件真正调用 useAiSession.send() */
  send: [text: string, image: ChatImage | undefined]
  /** 用户点击"停止" —— 父组件调用 useAiSession.interrupt() */
  interrupt: []
}>()

const userInput = ref('')

const inputRef = useTemplateRef<HTMLInputElement>('chat-input')
// chat-input-container 是整个输入容器的根 DOM（sticky bottom: 0 的那块白底）。
// 给父组件 expose 出去，让 JumpToBottomButton 跟着这块的高度浮动。
// 用 getter 暴露实际元素而不是 ref —— 避免父组件访问 ref 自动 unwrap 行为不一致
// （TS 类型推断会按 unwrap 后处理，但运行时是否 unwrap 取决于 Vue 版本与 proxy 实现）。
const containerRef = useTemplateRef<HTMLElement>('chat-input-container')
defineExpose({
  get containerEl() { return containerRef.value }
})

// 与设备宽度同步：移动端才启用 swipe-up 唤起菜单
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

// 移动端：按住输入框上滑唤出菜单
const { menuOpen: functionMenuOpen, close: closeFunctionMenu } = useSwipeUpMenu({
  origin: inputRef,
  isMobile: isMobileSize,
  containerRef
})

// 系统选图：菜单里的"图片"按钮 → closeFunctionMenu → 走 picker
const { trigger: triggerPicker } = useFilePicker({
  accept: 'image/*',
  onFile: pickFromFile
})

function triggerImagePicker() {
  closeFunctionMenu()
  triggerPicker()
}

// 建议气泡：2s 后浮现，仅在空输入 + 无消息时显示
const {
  defaultText,
  shouldShowSuggestion,
  suggestionAnimateState,
  applySuggestion: sendSuggestion
} = useSuggestionBanner({
  inputValue: userInput,
  isEmpty: computed(() => !userInput.value.trim()),
  noMessages: computed(() => props.noMessages),
  defaultText: '做个自我介绍',
  onApply: doSend
})

async function doSend() {
  const image = pendingImage.value ?? undefined
  if (!userInput.value.trim() && !image)
    return

  const text = userInput.value
  userInput.value = ''
  deletePendingImage()

  await nextTick()
  emit('send', text, image)
}

async function sendMessage() {
  await doSend()
}

async function onInterrupt() {
  emit('interrupt')
}
</script>
