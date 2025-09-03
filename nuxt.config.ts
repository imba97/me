import process from 'node:process'
import { fileURLToPath } from 'node:url'

import IntroxdResolver from '@introxd/components/resolver'
import LodashImports from 'lodash-imports'
import Components from 'unplugin-vue-components/vite'

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const { imports: lodashAutoImports } = LodashImports({ hasFrom: true })

export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    'floating-vue/nuxt',
    'motion-v/nuxt'
  ],

  image: {
    provider: process.env.NODE_ENV === 'production' ? 'netlify' : 'ipx'
  },

  css: [
    '@unocss/reset/tailwind-compat.css'
  ],

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
        from: '@introxd/components'
      })),
      ...lodashAutoImports
    ]
  },

  runtimeConfig: {
    navidromeApiUrl: process.env.NAVIDROME_API_URL,
    navidromeUsername: process.env.NAVIDROME_USERNAME,
    navidromePassword: process.env.NAVIDROME_PASSWORD,
    steamApiKey: process.env.STEAM_API_KEY,
    oneApiUrl: process.env.ONE_API_URL,
    oneApiKey: process.env.ONE_API_KEY,

    public: {
      steamId: process.env.STEAM_ID
    }
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
      Components({
        dts: r('./.nuxt/lib-components.d.ts'),
        resolvers: [
          IntroxdResolver()
        ]
      })
    ]
  },

  motionV: {
    components: true,
    utilities: true,
    prefix: 'motion'
  },

  compatibilityDate: 'latest',
  devtools: { enabled: false }
})
