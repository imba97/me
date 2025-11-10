<style lang="scss">
html,
body,
#__nuxt {
  --uno: h-full font-sans text-gray-9;
}
</style>

<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { initAnalytics } from '~/utils/analytics/51.la'

import '@introxd/components/style.css'

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

// 多页面数据同步
useMusicSync()
useSteamSync()
</script>
