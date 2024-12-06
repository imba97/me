<style scoped>
.marquee {
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.marquee span.overflow {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 10s linear infinite;
}

.gradually-hides {
  /* 渐隐效果 */
  mask: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
  -webkit-mask: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
}

@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(-100%, 0);
  }
}
</style>

<template>
  <div
    ref="marquee" class="marquee" :class="{
      'gradually-hides': isOverflowing
    }" of-hidden
  >
    <span
      v-if="visible" ref="text" :class="[
        props.textClass,
        isOverflowing ? 'overflow' : ''
      ]"
    >
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const props = defineProps<{
  textClass?: string
}>()

const slots = useSlots()

const visible = ref(true)
const isOverflowing = ref(false)

const marquee = ref<HTMLDivElement | null>(null)
const text = ref<HTMLSpanElement | null>(null)

let observer: ResizeObserver | null = null

watch(() => _get(slots.default?.(), '0.children'), () => {
  reset()
})

onMounted(() => {
  checkOverflow()

  observer = new ResizeObserver(() => {
    reset()
  })

  observer.observe(marquee.value!)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

function checkOverflow() {
  if (!text.value || !marquee.value) {
    return
  }

  if (text.value.offsetWidth > marquee.value.offsetWidth) {
    isOverflowing.value = true
  }
  else {
    isOverflowing.value = false
  }
}

function reset() {
  if (!text.value) {
    return
  }

  visible.value = false
  isOverflowing.value = false

  nextTick(() => {
    visible.value = true

    nextTick(() => {
      checkOverflow()
    })
  })
}
</script>
