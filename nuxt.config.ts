import process from 'node:process'

const isCloudflareMode = process.env.CLOUDFLARE_MODE !== 'false'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'floating-vue/nuxt',
    ...(isCloudflareMode ? ['@nuxthub/core'] : [])
  ],

  lodash: {
    prefix: '_',
    prefixSkip: false,
    upperAfterPrefix: false
  },

  css: [
    '@unocss/reset/tailwind.css'
  ],

  ...(isCloudflareMode
    ? {
        hub: {
          kv: true
        }
      }
    : {
        nitro: {
          preset: 'node-server'
        }
      }),

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
