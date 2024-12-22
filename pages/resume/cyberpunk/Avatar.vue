<style lang="scss" scoped>
.avatar-mask {
  mask-image: var(--mask-image);
  mask-repeat: no-repeat;
  mask-size: 200% 200%;
  mask-position: v-bind(maskPosition);
}
</style>

<template>
  <div ref="mask-avatar" pr>
    <div class="avatar-mask" pcc size-full bg-white />
    <div pcc size-full blur-2>
      <div class="avatar-mask" size-full bg-white />
    </div>
  </div>
</template>

<script setup lang="ts">
const maskRef = useTemplateRef('mask-avatar')
const maskPosition = ref('0 0')

onMounted(async () => {
  const image = await useLoadImage('/masks/avatar.png', 10000)
  maskRef.value?.style.setProperty('--mask-image', `url(${image})`)

  const position = [
    [0, 0],
    [0, 100],
    [100, 0],
    [100, 100]
  ]

  let index = 0

  setInterval(() => {
    const [top, left] = position[index++ % position.length]
    maskPosition.value = `${top}% ${left}%`
  }, 100)
})
</script>
