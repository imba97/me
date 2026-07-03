import process from 'node:process'
import { fileURLToPath } from 'node:url'

import IntroxdResolver from '@introxd/components/resolver'
import components from 'unplugin-vue-components/vite'

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url))

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
    provider: process.env.NODE_ENV === 'production' ? 'netlify' : 'ipx',
    domains: [
      'shared.akamai.steamstatic.com',
      'store.akamai.steamstatic.com'
    ]
  },

  lodash: {
    prefix: '_',
    prefixSkip: false,
    upperAfterPrefix: false
  },

  css: [
    '@unocss/reset/tailwind-compat.css',
    'markstream-vue/index.css'
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
      }))
    ]
  },

  runtimeConfig: {
    navidromeApiUrl: process.env.NAVIDROME_API_URL,
    navidromeUsername: process.env.NAVIDROME_USERNAME,
    navidromePassword: process.env.NAVIDROME_PASSWORD,
    steamApiKey: process.env.STEAM_API_KEY,
    aiApiUrl: process.env.AI_API_URL,
    aiApiKey: process.env.AI_API_KEY,
    aiModel: process.env.AI_MODEL ?? 'MiniMax-M3',
    aiMaxTokens: process.env.AI_MAX_TOKENS
      ? Number(process.env.AI_MAX_TOKENS)
      : 4096,
    githubAccessToken: process.env.GITHUB_ACCESS_TOKEN,

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

  future: {
    compatibilityVersion: 5
  },

  vite: {
    plugins: [
      components({
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
