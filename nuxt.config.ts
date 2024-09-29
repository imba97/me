import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'floating-vue/nuxt',
    '@nuxthub/core'
  ],

  unocss: {
    autoImport: false
  },

  lodash: {
    prefix: '_',
    prefixSkip: false,
    upperAfterPrefix: false
  },

  css: [
    '@unocss/reset/tailwind.css'
  ],

  hub: {
    kv: true
  },

  runtimeConfig: {
    NAVIDROME_API_URL: process.env.NAVIDROME_API_URL
  },

  imports: {
    dirs: [
      'composables/**/use*.ts',
      'enums/**'
    ]
  },

  compatibilityDate: '2024-07-25'
})
