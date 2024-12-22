<style lang="scss" scoped>
</style>

<template>
  <div v-if="visibleContainer" pr>
    <div pa top-0 left-0 size-full :style="imageStyle" :class="props.maskClass" />
    <div pa top-0 left-0 size-full blur-2>
      <div size-full :style="imageStyle" :class="props.maskClass" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LIGHT_MASK_KEY, type LightMaskProvide } from './types'

const props = withDefaults(
  defineProps<{
    src?: string
    size?: [number, number]
    maskClass?: string
    position?: [number, number]
  }>(),
  {
    maskClass: 'bg-white',
    size: () => [1, 1],
    position: () => [1, 1]
  }
)

const visibleContainer = ref(false)

const provideData = inject<LightMaskProvide>(LIGHT_MASK_KEY)

const maskSrc = provideData?.src || computed(() => props.src)
const [width, height] = provideData?.size || props.size
const [x, y] = props.position

const imageStyle = ref<Record<string, any>>({
  background: 'transparent'
})

watch(maskSrc, () => {
  if (!maskSrc.value) {
    return
  }

  imageStyle.value.maskImage = `url(${maskSrc.value})`
  visibleContainer.value = true
}, {
  immediate: true
})

onMounted(() => {
  const maxSize = _max([width, height])! * 100

  const maskX = _max([x - 1, 0])!
  const maskY = _max([y - 1, 0])!

  imageStyle.value = {
    maskImage: `url(${maskSrc.value})`,
    maskSize: `${maxSize}% ${maxSize}%`,
    maskPosition: `-${maskY * 100}% -${maskX * 100}%`
  }
})
</script>
