<template>
  <div pa top-0 left-0>
    <LightMaskProvider :src="background1" :size="[4, 4]">
      <div pa top-56 left="lt-md:-12 md:-32">
        <LightMask :position="[3, 3]" mask-class="bg-[#ff17f9]" rotate-20 class="lt-md:size-28 md:size-48" />
      </div>

      <div pa top-128 left="lt-md:-16 md:-36">
        <LightMask :position="[2, 3]" mask-class="bg-[#54eff4]" rotate--20 class="lt-md:size-32 md:size-40" />
      </div>

      <div pa top="lt-md:220 md:256" left="lt-md:-8 md:-24">
        <LightMask :position="[1, 4]" mask-class="bg-[#f11f9a]" rotate--40 class="lt-md:size-32 md:size-40" />
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
