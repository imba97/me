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
import 'uno.css'

import { initAnalytics } from './utils/analytics/51.la'

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
</script>
