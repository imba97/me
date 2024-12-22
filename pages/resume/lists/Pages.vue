<template>
  <BaseList>
    <li>
      <div v-if="visiblePlayingMusic" pr top-1 fyc gap-1>
        <IxIconText
          :icon-class="[
            'size-6.25 rounded-full',
            !hasImage ? 'i-ph-music-note-simple-duotone' : '',
            music.playing && hasImage ? 'animate-spin animate-duration-30000' : ''
          ].join(' ')" :src="music.image" href="/playing"
        >
          我正在听的音乐
        </IxIconText>

        <div v-show="music.playing" pr top="0.5" text="3 gray-3" lt-md:hidden md:block>
          ( {{ music.name }} - {{ music.artist }} )
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
import BaseList from './BaseList.vue'

const music = useMusic()

const visiblePlayingMusic = ref(true)

const hasImage = computed(() => music.image !== '')

watch(() => music, () => {
  visiblePlayingMusic.value = false
  nextTick(() => {
    visiblePlayingMusic.value = true
  })
}, {
  deep: true
})
</script>
