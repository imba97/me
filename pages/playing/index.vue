<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'

import { find, get } from 'lodash-es'

import { createRipples } from '~/utils/effects/ripples'

const playing = ref(false)
const imageLoaded = ref(false)

const visibleText = ref(true)

const music = reactive({
  name: '加载中',
  artist: '',
  image: '',
})

let stopRipples: () => void

let requestTimer: NodeJS.Timeout | null = null

watch(music, () => {
  resetText()
})

onNuxtReady(() => {
  stopRipples = createRipples('ripples')

  getMusic()

  // 10 秒获取一次
  requestTimer = setInterval(() => {
    getMusic()
  }, 10000)
})

onUnmounted(() => {
  if (requestTimer) {
    clearInterval(requestTimer)
    requestTimer = null
  }
})

async function getMusic() {
  const response = await useFetch('/api/playing')

  if (!response || !response.data.value) {
    return
  }

  const data = response.data.value

  const name = get(data, 'name')
  const artist = get(data, 'artist.#text')

  if (!name || !artist) {
    return
  }

  music.name = name
  music.artist = artist

  playing.value = get(data, '@attr.nowplaying') === 'true'

  let imageUrl = get(data, 'albumCover', '')

  if (imageUrl === '') {
    imageUrl = get(find(get(data, 'image'), { size: 'extralarge' }), '#text')!
  }

  if (imageUrl && imageUrl !== music.image) {
    const image = new Image()
    image.src = imageUrl
    image.onload = () => {
      imageLoaded.value = true
      stopRipples()
      music.image = imageUrl
    }
    image.onerror = () => {
      imageLoaded.value = false

      if (stopRipples) {
        stopRipples()
      }

      stopRipples = createRipples('ripples')
      music.image = ''
    }
  }
}

function resetText() {
  visibleText.value = false
  nextTick(() => {
    visibleText.value = true
  })
}
</script>

<template>
  <div h-full w-full of-hidden>
    <div h-full w-full flex="~ col" items-center justify-center>
      <div
        p-10 lt-md="w-[90%]" md="w-[60%]" flex="~ col" items-center justify-center gap-2 rounded-10
        :class="imageLoaded ? 'bg-[rgba(255,255,255,0.35)]' : 'bg-[rgba(0,0,0,0.35)]'"
      >
        <div text="gray-6 lt-md:6 md:8">
          {{ playing ? '我正在听' : '当前没在听歌，最近听了' }}
        </div>
        <div
          lt-md="h-48 w-48" md="h-86 w-86" my-4 rounded-full of-hidden
          :class="playing ? 'animate-spin animate-duration-30000' : ''"
        >
          <img v-show="imageLoaded" :src="music.image" h-full w-full object-cover animate-fade-in>
          <div h-full w-full rounded-full b="10 [rgba(0,0,0,0.5)] solid">
            <div
              v-show="!imageLoaded" i-ph-music-note-simple-duotone bg="[rgba(0,0,0,0.5)]" relative top-6 left-6
              h="80%" w="80%"
            />
          </div>
        </div>
        <Text
          v-if="visibleText" :class="{
            'music-text': imageLoaded,
          }" text="gray-6 center lt-md:8 md:12" w-full h="lt-md:12 md:22" font-bold
        >
          {{ music.name }}
        </Text>
        <Text
          v-if="visibleText" :class="{
            'music-text': imageLoaded,
          }" text="gray-6 center lt-md:4 md:6" w-full h="lt-md:8 md:10"
        >
          {{ music.artist }}
        </Text>
      </div>
    </div>

    <div fixed top="-10%" left="-10%" h="120%" w="120%" z--1 blur-32>
      <img v-show="imageLoaded" :src="music.image" h-full w-full object-cover select-none animate-fade-in>
      <canvas v-show="!imageLoaded" id="ripples" h-full w-full />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.music-text {
  :deep() {
    span {
      @supports (-webkit-background-clip: text) or (background-clip: text) {
        background: linear-gradient(90deg, #1062af 0%, #7828be 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    }
  }
}
</style>
