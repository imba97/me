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
const visible = useDocumentVisibility()

let requestTimer: NodeJS.Timeout | null = null

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
    startMusicInfoRequest()
  }
  else {
    if (requestTimer) {
      clearInterval(requestTimer)
      requestTimer = null
    }
  }
})

onNuxtReady(() => {
  startMusicInfoRequest()
})

function startMusicInfoRequest() {
  if (requestTimer) {
    return
  }

  music.fetchMusic()

  requestTimer = setInterval(() => {
    music.fetchMusic()
  }, music.fetchInterval)
}
</script>
