<template>
  <slot />
</template>

<script lang="ts" setup>
import type { LightMaskProvide } from './types'
import { LIGHT_MASK_KEY } from './types'

const props = withDefaults(
  defineProps<{
    src: string
    size?: [number, number]
  }>(),
  {
    size: () => [1, 1]
  }
)

provide<LightMaskProvide>(LIGHT_MASK_KEY, {
  size: props.size,
  src: computed(() => props.src)
})
</script>
