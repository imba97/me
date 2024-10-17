import process from 'node:process'

const isCloudflarePagesMode
  = typeof process.env.BUILD_MODE === 'undefined'
  || process.env.BUILD_MODE === 'cloudflare-pages'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'floating-vue/nuxt',
    ...(isCloudflarePagesMode ? ['@nuxthub/core'] : [])
  ],

  lodash: {
    prefix: '_',
    prefixSkip: false,
    upperAfterPrefix: false
  },

  css: [
    '@unocss/reset/tailwind.css'
  ],

  ...(isCloudflarePagesMode
    ? {
        hub: {
          kv: true
        }
      }
    : {}),

  nitro: {
    preset: process.env.BUILD_MODE
  },

  imports: {
    dirs: [
      'composables/**/use*.ts',
      'enums/**'
    ]
  },

  runtimeConfig: {
    env: {
      NAVIDROME_API_URL: process.env.NAVIDROME_API_URL,
      NAVIDROME_USERNAME: process.env.NAVIDROME_USERNAME,
      NAVIDROME_PASSWORD: process.env.NAVIDROME_PASSWORD
    } as Record<string, string>
  },

  compatibilityDate: '2024-07-25',
  devtools: { enabled: false }
})
