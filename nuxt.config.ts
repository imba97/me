export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'floating-vue/nuxt',
    '@nuxthub/core',
    '@nuxtjs/seo'
  ],

  site: {
    url: 'https://imba97-me.nuxt.dev'
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

  imports: {
    dirs: [
      'composables/**/use*.ts',
      'enums/**'
    ]
  },

  compatibilityDate: '2024-07-25'
})
