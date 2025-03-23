<template>
  <slot />
</template>

<script lang="ts" setup>
import type { AnimatedDelay } from '~/types/animated'
import { AnimatedDelayKey } from '~/types/animated'

const props = withDefaults(defineProps<{
  delayIncrement?: number
}>(), {
  delayIncrement: 0.2
})

const globalDelay = ref(0)

const animatedDelay: AnimatedDelay = {
  getNextDelay: () => {
    const delay = globalDelay.value
    globalDelay.value += props.delayIncrement
    return delay
  },
  resetDelay: () => {
    globalDelay.value = 0
  }
}

provide(AnimatedDelayKey, animatedDelay)
</script>
