<style scoped>
.mask-97 {
  mask-image: var(--mask-image);
  mask-repeat: no-repeat;
  mask-size: auto 80%;
  mask-position: center center;
}
</style>

<template>
  <!-- 背景 97 -->
  <div ref="mask-97" pa top-0 left-0 size-screen fcc of-hidden>
    <CyberpunkGlitch v-slot="{ isPlaying }" :translate-x="[-100, 100]" :duration="[200, 500]" :interval="[5000, 10000]">
      <div pr>
        <div class="mask-97" size="lt-md:128 md:screen" bg="white" :class="isPlaying ? 'op-5' : 'op-3'" />

        <div
          pa top="-0.75" left="-0.75" class="mask-97" size="lt-md:128 md:screen" bg="red"
          :class="isPlaying ? 'op-5' : 'op-10'"
        />

        <div
          pa top="0.75" left="0.75" class="mask-97" size="lt-md:128 md:screen" bg="#00E6F6"
          :class="isPlaying ? 'op-5' : 'op-10'"
        />
      </div>
    </CyberpunkGlitch>
  </div>
</template>

<script lang="ts" setup>
const maskRef = useTemplateRef('mask-97')

onMounted(async () => {
  const maskImage = await useLoadImage('/masks/97.png', 10000)
  maskRef.value?.style.setProperty('--mask-image', `url(${maskImage})`)
})
</script>
