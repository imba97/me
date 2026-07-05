<template>
  <button
    v-show="visible"
    type="button"
    aria-label="回到底部"
    size-10 rounded-full bg-white shadow-lg border border-gray-200
    text-gray-600 hover="bg-gray-50 text-blue-500"
    transition-all duration-200
    flex items-center justify-center
    :class="{ 'animate-bounce': streaming }"
    fixed right-6 z-20
    :style="{ bottom }"
    @click="emit('click')"
  >
    <div i-carbon-arrow-down />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  /** 输入区容器 ref。按钮跟随其高度浮动以避免被发送按钮遮挡 */
  areaEl: HTMLElement | null
  /** 是否正在 streaming（影响是否 bounce 提示） */
  streaming: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

// useElementBounding 直接给的是 border-box 全高度，比 useElementSize 在 v14 签名调整后更直接
const target = computed(() => props.areaEl)
const { height } = useElementBounding(target)

const bottom = computed(() =>
  height.value > 0
    ? `calc(${height.value}px + 0.5rem)`
    : '5rem'
)
</script>
