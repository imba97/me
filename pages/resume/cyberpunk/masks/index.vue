<style lang="scss" scoped>
.animate-float {
  animation: float 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes float {
  0% {
    transform: translate(0, 0%);
  }

  25% {
    transform: translate(0, 5%);
  }

  50% {
    transform: translate(0, -5%);
  }

  75% {
    transform: translate(0, 5%);
  }

  100% {
    transform: translate(0, 0%);
  }
}
</style>

<template>
  <div w-full pr pointer-events-none>
    <div pa top-14>
      <Mask97 />
    </div>

    <div pxc w="lt-md:full md:prose">
      <div h-72 />

      <LightMaskProvider :src="background1" :size="[4, 4]">
        <div>
          <div pr fyc justify-between>
            <div h-36 pr>
              <div pa top-0 left-0>
                <LightMask :position="[1, 1]" mask-class="bg-[#6f75ed]" rotate--30 size-25 />
              </div>
              <div pa top-2 left-12>
                <LightMask :position="[1, 2]" mask-class="bg-[#6f75ed]" rotate--40 size-25 />
              </div>

              <div pa top--12 left-12>
                <LightMask :position="[1, 1]" mask-class="bg-[#6f75ed]" rotate--40 size-25 />
              </div>

              <div pa top-16 left-12>
                <LightMask :position="[1, 1]" mask-class="bg-[#6f75ed]" rotate--40 size-25 />
              </div>
            </div>

            <div>
              <LightMask :position="[1, 3]" mask-class="bg-[#54eff4]" rotate-40 class="lt-md:size-25 md:size-50" />
            </div>

            <div pa bottom-0>
              <div pa top-0 left-0>
                <LightMask :position="[4, 1]" mask-class="bg-[#3c5fff]" rotate--60 class="lt-md:size-30 md:size-35" />
              </div>

              <div pa top--3 left-12>
                <LightMask :position="[4, 2]" mask-class="bg-[#cd5abe]" rotate--40 class="lt-md:size-30 md:size-35" />
              </div>

              <div pa top--6 left-24>
                <LightMask :position="[4, 3]" mask-class="bg-[#3c5fff]" rotate--30 class="lt-md:size-30 md:size-35" />
              </div>

              <div pa top--6 left-36>
                <LightMask :position="[4, 4]" mask-class="bg-[#cd5abe]" rotate--20 class="lt-md:size-30 md:size-35" />
              </div>
            </div>
          </div>

          <div fyc justify-end mt-32>
            <LightMask :position="[2, 4]" mask-class="bg-[#cd5abe]" rotate-20 class="lt-md:size-40 md:size-50" />
          </div>
        </div>
      </LightMaskProvider>

      <LightMaskProvider :src="background2" :size="[4, 4]">
        <div pr lt-md:h-40 md:h-48>
          <div pa top--48 left="lt-md:24 md:36">
            <LightMask :position="[2, 2]" mask-class="bg-[#8a68e8]" class="lt-md:size-32 md:size-36" />
          </div>

          <div pa top--16 left-0>
            <LightMask :position="[3, 1]" mask-class="bg-[#ff17f9]" class="lt-md:size-28 md:size-32" />
          </div>

          <div pxc>
            <IxCyberpunkGlitch :duration="[500, 800]" :interval="[3000, 6000]">
              <LightMask :position="[2, 1]" mask-class="bg-white" rotate--10 class="lt-md:size-72 md:size-84" />
            </IxCyberpunkGlitch>
          </div>
        </div>
      </LightMaskProvider>

      <LightMaskProvider :src="background1" :size="[4, 4]">
        <div fyc justify-between mt-32>
          <LightMask :position="[2, 1]" mask-class="bg-amber" class="lt-md:size-40 md:size-50" />

          <div h-16 pr>
            <div pa top-0 right-0>
              <LightMask :position="[1, 1]" mask-class="bg-[#6f75ed]" rotate-30 size-25 />
            </div>
            <div pa top-2 right-12>
              <LightMask :position="[1, 1]" mask-class="bg-[#6f75ed]" rotate-40 size-25 />
            </div>

            <div pa top-16 right-12>
              <LightMask :position="[1, 2]" mask-class="bg-[#6f75ed]" rotate-40 size-25 />
            </div>
          </div>
        </div>
      </LightMaskProvider>

      <LightMaskProvider :src="background2" :size="[4, 4]">
        <div pr h="lt-md:40 md:48">
          <div pxc top-0>
            <LightMask :position="[2, 4]" mask-class="bg-[#33a474]" rotate-10 class="lt-md:size-72 md:size-84" />
          </div>

          <div pxc top--16>
            <LightMask :position="[2, 3]" mask-class="bg-[#00aeec]" size-30 />
          </div>

          <div pa top-68 w-full flex justify-between>
            <LightMask :position="[1, 1]" mask-class="bg-[#d92e3b]" rotate--10 size-30 />
            <LightMask :position="[1, 2]" mask-class="bg-[#9545f0]" rotate-20 size-40 />
          </div>

          <div pa top-112 w-full>
            <div pa bottom-0>
              <div pa top-0 left-0>
                <LightMask :position="[4, 1]" mask-class="bg-[#cd5abe]" rotate-30 class="lt-md:size-25 md:size-30" />
              </div>

              <div pa top--3 left-18>
                <LightMask :position="[4, 2]" mask-class="bg-[#3c5fff]" rotate--20 class="lt-md:size-25 md:size-30" />
              </div>

              <div pa top--6 left-36>
                <LightMask :position="[4, 3]" mask-class="bg-[#cd5abe]" rotate-10 class="lt-md:size-25 md:size-30" />
              </div>

              <div pa top--6 left-48>
                <LightMask :position="[4, 4]" mask-class="bg-[#3c5fff]" rotate--20 class="lt-md:size-25 md:size-30" />
              </div>
            </div>
          </div>
        </div>
      </LightMaskProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import Mask97 from './Mask97.vue'

const background1 = ref('')
const background2 = ref('')

onMounted(async () => {
  background1.value = await useLoadImage('/masks/background-1.png', 10000)
  background2.value = await useLoadImage('/masks/background-2.png', 10000)
})
</script>
