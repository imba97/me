<style scoped>
.ai-chat-container {
  position: relative;
  padding-bottom: env(safe-area-inset-bottom, 0);
  /* 禁止双指缩放 / 双击缩放，但允许滚动 */
  touch-action: pan-x pan-y;
  overscroll-behavior: contain;
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
          <!-- 平台相关文案避免 SSR/CSR 内容不一致导致的 hydration mismatch -->
          <ClientOnly>
            <p>{{ isMobileSize ? '按住输入框上滑添加图片' : '在输入框中粘贴图片' }}</p>
            <template #fallback>
              <p>在输入框中粘贴图片</p>
            </template>
          </ClientOnly>
        </div>

        <JumpToBottomButton
          :visible="showJumpButton"
          :area-el="inputAreaEl"
          :streaming="isStreaming"
          @click="scrollToBottom"
        />

        <ChatMessageItem
          v-for="(msg, idx) in visibleMessages"
          :key="msg.id"
          :ref="msg.role === 'assistant' ? trackAssistantBubble : undefined"
          :msg="msg"
          :is-last="idx === visibleMessages.length - 1"
          :is-streaming="isStreaming"
        />
      </div>
    </div>

    <ChatInput
      ref="chatInputRef"
      :is-streaming="isStreaming"
      :no-messages="visibleMessages.length === 0"
      :on-input-focus="onInputFocus"
      @send="handleSend"
      @interrupt="interrupt"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ChatImage } from '~~/shared/ai/chat'
import ChatInput from '~/components/ChatInput.vue'

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

// 把工具消息和「空内容且非最后一条」的 assistant 消息过滤掉，只展示用户真正需要看的
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

// vueuse 没有直接的 isMobile；项目里以 670px 为断点（与 Status 组件复用同一规则）
const { isMobileSize } = useMobileSize()

// 消息列表的自动滚动 / 「回到底部」按钮显隐
const messageContainerRef = useTemplateRef<HTMLElement>('message-container')
const {
  showJumpButton,
  trackAssistantBubble,
  scrollToBottom,
  onInputFocus
} = useAutoScroll(messageContainerRef)

// ChatInput 通过 defineExpose 暴露 containerEl（输入容器 DOM，getter 形式返回当前元素）。
// JumpToBottomButton 跟随其高度浮动。
const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)
const inputAreaEl = computed(() => chatInputRef.value?.containerEl ?? null)

async function handleSend(text: string, image: ChatImage | undefined) {
  await nextTick()
  scrollToBottom()
  await send(text, image)
}
</script>
