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
    provider: 'netlify',
    domains: ['imba97.me'],
    format: ['avif', 'webp']
  },

  lodash: {
    prefix: '_',
    prefixSkip: false,
    upperAfterPrefix: false
  },

  css: [
    '@unocss/reset/tailwind.css'
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
        from: `@introxd/components`
      }))
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

  motionV: {
    components: true, // 启用 Motion 组件
    utilities: true, // 启用 Motion 工具类
    prefix: 'motion' // 可选：自定义前缀
  },

  compatibilityDate: '2024-07-25',
  devtools: { enabled: false }
})
