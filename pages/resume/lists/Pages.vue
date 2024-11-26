<template>
  <BaseList>
    <li>
      <div v-if="visiblePlayingMusic" pr top-1 fyc gap-1>
        <IxIconText
          :icon-class="[
            'size-6.25 rounded-full',
            props.music.playing ? 'animate-spin animate-duration-30000' : ''
          ].join(' ')" :src="props.music.image" href="/playing"
        >
          我正在听的音乐
        </IxIconText>

        <div v-show="props.music.playing" pr top="0.5" text="3 gray-3">
          ( {{ props.music.name }} - {{ props.music.artist }} )
        </div>
      </div>
    </li>

    <li>
      <div pr top-1>
        <IxIconText src="https://introxd.com/favicon.png" icon-class="size-5" href="https://introxd.com">
          Introxd 定制个人简介
        </IxIconText>
      </div>
    </li>

    <li>
      <div pr top-1>
        <IxIconText src="https://introxd.com/favicon.png" icon-class="size-5" href="https://docs.introxd.com">
          Introxd 组件库
        </IxIconText>
      </div>
    </li>
  </BaseList>
</template>

<script lang="ts" setup>
import type { MusicInfo } from '../types'

import BaseList from './BaseList.vue'

const props = defineProps<{
  music: MusicInfo
}>()

const visiblePlayingMusic = ref(false)

watch(() => props.music, () => {
  visiblePlayingMusic.value = false
  nextTick(() => {
    visiblePlayingMusic.value = true
  })
}, {
  deep: true
})
</script>
