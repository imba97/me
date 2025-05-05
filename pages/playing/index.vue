<style lang="scss" scoped>
.music-text {
  :deep() {
    span {
      @supports (-webkit-background-clip: text) or (background-clip: text) {
        background: linear-gradient(90deg, #8ec6fa 0%, #d09bff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    }
  }
}
</style>

<template>
  <div size-full of-hidden>
    <div size-full flex="~ col" items-center justify-center>
      <div
        p-10 lt-md="w-[90%]" md="w-[60%]" flex="~ col" items-center justify-center gap-2 rounded-10
        bg="[rgba(0,0,0,0.5)]"
      >
        <div text="white lt-md:6 md:8">
          {{ music.playing ? '我正在听' : '当前没在听歌，最近听了' }}
        </div>
        <div
          lt-md="size-48" md="size-86" my-4 rounded-full of-hidden
          :class="music.playing ? 'animate-spin animate-duration-30000' : ''"
        >
          <MeImage :src="music.image" size-full object-cover animate-fade-in />
          <div size-full rounded-full b="10 [rgba(0,0,0,0.5)] solid">
            <div
              v-show="!music.hasImage" i-ph-music-note-simple-duotone bg="[rgba(0,0,0,0.5)]" relative top-6 left-6
              h="80%" w="80%"
            />
          </div>
        </div>
        <Text
          v-if="visibleText" :class="{
            'music-text': music.hasImage
          }" text="gray-6 center lt-md:8 md:12" w-full h="lt-md:12 md:22" font-bold
        >
          {{ music.name || '加载中' }}
        </Text>
        <Text
          v-if="visibleText" :class="{
            'music-text': music.hasImage
          }" text="gray-6 center lt-md:4 md:6" w-full h="lt-md:8 md:10"
        >
          {{ music.artist }}
        </Text>
      </div>
    </div>

    <div fixed top="-10%" left="-10%" h="120%" w="120%" z--1 blur-32>
      <MeImage
        v-show="music.hasImage"
        :src="music.image" size-full object-cover select-none animate-fade-in
        @load="onLoadImage"
      />
      <canvas v-show="!music.hasImage" id="ripples" size-full />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { createRipples } from '~/utils/effects/ripples'

const visibleText = ref(true)

const music = useMusic()

let stopRipples: () => void

onNuxtReady(() => {
  stopRipples = createRipples('ripples')
})

function onLoadImage() {
  stopRipples()
}
</script>
