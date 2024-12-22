<template>
  <div class="dark" size-full px-7 py-10 of-x-hidden bg-slate-950>
    <div inline-block p-1 rounded-full bg="white opacity-75" @click="router.push('/resume')">
      <div i-ic-round-arrow-back size-5 />
    </div>
    <template v-if="loading">
      <div fcc>
        <div i-eos-icons-loading size-8 bg-gray />
      </div>
    </template>
    <template v-else>
      <div animate-bounce-in>
        <Masks />

        <div prose ma>
          <div fcc>
            <Avatar size-36 />
          </div>

          <div mt-8>
            <IxCyberpunkCordon>
              <div fyc text-6 font-bold>
                Hello 各位好，我是 imba久期
              </div>
            </IxCyberpunkCordon>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Avatar from './Avatar.vue'
import Masks from './masks/index.vue'

const router = useRouter()
const loading = ref(true)

onNuxtReady(() => {
  // TODO: 优化图片加载
  Promise.all(
    [
      '/masks/97.png',
      '/masks/avatar.png',
      '/masks/background-1.png',
      '/masks/background-2.png'
    ].map(url => useLoadImage(url, 10000))
  ).then(() => {
    loading.value = false
  })
})

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
