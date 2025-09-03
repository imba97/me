<template>
  <motion.div
    :initial="{ opacity: 0, y: 30 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :in-view-options="{ once: true }"
    :transition="{ duration: 0.8, delay: computedDelay }"
  >
    <div ref="animation-element">
      <slot />
    </div>
  </motion.div>
</template>

<script lang="ts" setup>
import type { AnimatedDelay } from '@@/types/animated'
import { AnimatedDelayKey } from '@@/types/animated'
import { useIntersectionObserver } from '@vueuse/core'
import { motion } from 'motion-v'

const props = withDefaults(
  defineProps<{
    delay?: number
  }>(),
  {
    delay: 0.2
  }
)

const animatedDelay = inject<AnimatedDelay>(AnimatedDelayKey)

const elementRef = useTemplateRef('animation-element')
const isIntersecting = ref(false)

useIntersectionObserver(elementRef, ([entry]) => {
  isIntersecting.value = entry?.isIntersecting ?? false
}, {
  threshold: 0
})

const isFirstScreen = computed(() => {
  if (typeof window === 'undefined') {
    return false
  }

  const rect = elementRef.value?.getBoundingClientRect()

  return rect
    ? rect.top >= 0 && rect.bottom <= window.innerHeight
    : false
})

const computedDelay = ref(0)

watch(() => elementRef.value, (newValue) => {
  if (newValue) {
    calculateDelay()
  }
}, { immediate: true })

onMounted(() => {
  calculateDelay()
})

function calculateDelay() {
  if (isFirstScreen.value && animatedDelay) {
    computedDelay.value = animatedDelay.getNextDelay()
  }
  else {
    computedDelay.value = props.delay
  }
}
</script>
