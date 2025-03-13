<style lang="scss">
html,
body,
#__nuxt {
  --uno: h-full;
}
</style>

<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { initAnalytics } from '../utils/analytics/51.la'

import '@introxd/components/style.css'

const music = useMusic()
const steam = useSteam()

const visible = useDocumentVisibility()

let musicTimer: NodeJS.Timeout | null = null
let steamTimer: NodeJS.Timeout | null = null

useHead({
  title: 'imba97',
  htmlAttrs: {
    lang: 'zh'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png'
    }
  ],
  script: [
    import.meta.dev
      ? {}
      : {
          id: 'LA_COLLECT',
          src: '//sdk.51.la/js-sdk-pro.min.js'
        }
  ]
})

initAnalytics()

watch(visible, () => {
  if (visible.value === 'visible') {
    startRequestInterval()
  }
  else {
    stopRequestInterval()
  }
})

onNuxtReady(() => {
  startRequestInterval()
})

function startRequestInterval() {
  if (!musicTimer) {
    music.fetchMusic()

    musicTimer = setInterval(() => {
      music.fetchMusic()
    }, music.fetchInterval)
  }

  if (!steamTimer) {
    steam.fetchPlayingGame()

    steamTimer = setInterval(() => {
      steam.fetchPlayingGame()
    }, steam.fetchInterval)
  }
}

function stopRequestInterval() {
  if (musicTimer) {
    clearInterval(musicTimer)
    musicTimer = null
  }

  if (steamTimer) {
    clearInterval(steamTimer)
    steamTimer = null
  }
}
</script>
