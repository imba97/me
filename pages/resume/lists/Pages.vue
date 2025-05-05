<template>
  <BaseList>
    <li>
      <div pr top-1>
        <IxIconText
          icon-class="i-mynaui-tool text-white size-6" href="#"
          bg-slate-950
          hover="bg-slate-950! bg-opacity-70!"
          @click.stop="router.push('/resume/cyberpunk')"
        >
          <IxCyberpunkGlitch>
            <span text-white>赛博朋克页面</span>
          </IxCyberpunkGlitch>
        </IxIconText>
      </div>
    </li>

    <li>
      <div v-if="visiblePlayingMusic" pr top-1 fyc gap-1>
        <IxIconText
          :icon-class="[
            'size-6.25 rounded-full',
            !music.hasImage ? 'i-ph-music-note-simple-duotone' : '',
            music.playing && music.hasImage ? 'animate-spin animate-duration-30000' : ''
          ].join(' ')" :src="music.image" href="/playing"
        >
          我正在听的音乐
        </IxIconText>

        <div v-show="music.playing" pr top="0.5" text="3 gray-3" lt-md:hidden md:block>
          ( {{ music.name }} - {{ music.artist }} )
        </div>
      </div>
    </li>
  </BaseList>
</template>

<script lang="ts" setup>
import BaseList from './BaseList.vue'

const router = useRouter()

const music = useMusic()

const visiblePlayingMusic = ref(true)

watch(() => music, () => {
  visiblePlayingMusic.value = false
  nextTick(() => {
    visiblePlayingMusic.value = true
  })
}, {
  deep: true
})
</script>
