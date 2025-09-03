<template>
  <motion.div
    flex
    max-w="80%"
    :class="[props.position === 'right' ? 'ml-auto justify-end' : '']"
    :initial="{ opacity: 0, y: 10 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3 }"
  >
    <!-- 左侧布局：头像在左，气泡在右 -->
    <template v-if="props.position === 'left'">
      <div size-8 shrink-0 rounded-full flex items-center justify-center mr-2 of-hidden :class="props.avatarClass">
        <slot name="avatar" />
      </div>
      <div rounded-lg p-3 shadow rounded-tl-none :class="[props.bgClass]">
        <slot />
      </div>
    </template>

    <!-- 右侧布局：气泡在左，头像在右 -->
    <template v-else>
      <div rounded-lg p-3 shadow rounded-tr-none :class="[props.bgClass]">
        <slot />
      </div>
      <div size-8 shrink-0 rounded-full flex items-center justify-center ml-2 of-hidden :class="props.avatarClass">
        <slot name="avatar" />
      </div>
    </template>
  </motion.div>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'

const props = withDefaults(
  defineProps<{
    position?: 'left' | 'right'
    bgClass?: string
    avatarClass?: string
  }>(),
  {
    position: 'left',
    bgClass: 'bg-white',
    avatarClass: 'bg-blue-500 text-white'
  }
)
</script>
