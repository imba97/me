import process from 'node:process'
import { fileURLToPath } from 'node:url'

import IntroxdResolver from '@introxd/components/resolver'
import components from 'unplugin-vue-components/vite'

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const isCloudflarePagesMode
  = typeof process.env.BUILD_MODE === 'undefined'
    || process.env.BUILD_MODE === 'cloudflare-pages'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
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
          cache: true
        }
      }
    : {}),

  nitro: {
    preset: process.env.BUILD_MODE
  },

  imports: {
    dirs: [
      'composables/**'
    ],
    imports: [
      ...[
        'IconTextFont',
        'IconTextPreset'
      ].map(name => ({
        name,
        from: `@introxd/components`
      }))
    ]
  },

  runtimeConfig: {
    env: {
      NAVIDROME_API_URL: process.env.NAVIDROME_API_URL,
      NAVIDROME_USERNAME: process.env.NAVIDROME_USERNAME,
      NAVIDROME_PASSWORD: process.env.NAVIDROME_PASSWORD,
      STEAM_API_KEY: process.env.STEAM_API_KEY,
      STEAM_ID: process.env.STEAM_ID
    } as Record<string, string>
  },

  typescript: {
    tsConfig: {
      include: [
        './lib-components.d.ts'
      ]
    }
  },

  vite: {
    plugins: [
      components({
        dts: r('./.nuxt/lib-components.d.ts'),
        resolvers: [
          IntroxdResolver()
        ]
      })
    ],

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  },

  compatibilityDate: '2024-07-25',
  devtools: { enabled: false }
})
