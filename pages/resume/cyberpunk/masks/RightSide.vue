<template>
  <div pa top-0 right-0>
    <LightMaskProvider :src="background1" :size="[4, 4]">
      <div pa top-56 right="lt-md:-8 md:-12">
        <LightMask :position="[2, 1]" mask-class="bg-[#04ff03]" rotate-40 class="lt-md:size-16 md:size-24" />
      </div>

      <div pa top-128 right="lt-md:-18 md:-24">
        <LightMask :position="[3, 4]" mask-class="bg-[#f7baff]" rotate-10 class="lt-md:size-28 md:size-48" />
      </div>

      <div pa top="lt-md:240 md:230" left="lt-md:-32 md:-24">
        <LightMask :position="[3, 2]" mask-class="bg-[#3c5fff]" rotate-40 class="lt-md:size-32 md:size-50" />
      </div>
    </LightMaskProvider>
  </div>
</template>

<script lang="ts" setup>
const background1 = ref('')
const background2 = ref('')

onMounted(async () => {
  background1.value = await useLoadImage('/masks/background-1.png', 10000)
  background2.value = await useLoadImage('/masks/background-2.png', 10000)
})
</script>
