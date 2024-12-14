<style lang="scss" scoped>
.avatar-mask {
  mask-image: url("/masks/avatar.png");
  mask-repeat: no-repeat;
  mask-size: 200% 200%;
  mask-position: v-bind(maskPosition);
}
</style>

<template>
  <div pr>
    <img src="/favicon.png" op-50>
    <div class="avatar-mask" pcc size="250%" bg-white />
    <div pcc size="250%" blur-2>
      <div class="avatar-mask" size-full bg-white />
    </div>
  </div>
</template>

<script setup lang="ts">
const maskPosition = ref('0 0')

onMounted(() => {
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
