export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'floating-vue/nuxt',
    '@nuxthub/core'
  ],

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

  imports: {
    dirs: [
      'composables/**/use*.ts',
      'enums/**'
    ]
  },

  compatibilityDate: '2024-07-25',
  devtools: { enabled: false }
})
