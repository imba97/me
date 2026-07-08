<!--
  单根 <div> 是关键：模板是 v-if/v-else，编译产物是 Fragment，`proxy.$el` 会指向
  fragment 里的注释节点（nodeType=8），被 use-auto-scroll 的 HTMLElement 守卫过滤，
  导致 ResizeObserver 没目标、新消息和流式输出都不滚动
  flex + items-end：让 retry 按钮（错误时）贴在气泡右下角底部对齐
-->
<template>
  <div class="flex items-end gap-2">
    <!-- AI 消息 -->
    <MessageBubble
      v-if="msg.role === 'assistant'"
      position="left"
      bg-class="bg-white"
    >
      <template #avatar>
        <NuxtImg src="/favicon.png" alt="avatar" size-full />
      </template>

      <template v-if="msg.error">
        <div flex items-center gap-2 text="sm gray-500">
          <div i-carbon-warning />
          <span>{{ msg.error }}</span>
        </div>
      </template>
      <template v-else-if="msg.content.length > 0">
        <MarkdownRender
          mode="chat"
          :content="msg.content"
          :final="!isStreaming || !isLast"
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

    <button
      v-if="msg.role === 'assistant' && msg.error"
      type="button"
      aria-label="重试"
      class="shrink-0 mb-1 size-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
      @click="$emit('retry')"
    >
      <div i-carbon-restart />
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { ChatMessage } from '~~/shared/ai/chat'
import MarkdownRender from 'markstream-vue'
import MessageBubble from '~/components/MessageBubble.vue'
import { chatImageToDataUrl } from '~/utils/chat-image'

defineProps<{
  msg: ChatMessage
  isLast: boolean
  isStreaming: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>
