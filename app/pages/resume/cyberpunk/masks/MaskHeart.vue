<style scoped>
.mask-heart {
  --mask-bg: url("/masks/heart-1.png");
  mask: var(--mask-bg) 0 0 / 100% 100%;
}
</style>

<template>
  <div pr>
    <div ref="heart" class="mask-heart" pa top-0 left-0 size-full bg-current />
    <div pa top-0 left-0 size-full blur-xl>
      <div class="mask-heart" size-full bg-current />
    </div>
  </div>
</template>

<script setup lang="ts">
const heart = useTemplateRef('heart')

onMounted(() => {
  let currentIndex = 1

  setInterval(() => {
    currentIndex = currentIndex === 3 ? 1 : currentIndex + 1
    heart.value!.style.setProperty('--mask-bg', `url("/masks/heart-${currentIndex}.png")`)
  }, 120)
})
</script>
