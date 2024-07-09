<script lang="ts" setup>
import 'uno.css'

useHead({
  title: 'imba97',
  htmlAttrs: {
    lang: 'zh',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png',
    },
  ],
})
</script>

<template>
  <NuxtPage />
</template>

<style lang="scss">
html,
body,
#__nuxt {
  --uno: h-full;
}
</style>
