import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

import { presetUseful } from 'unocss-preset-useful'

export default defineConfig({
  theme: {
    colors: {
      primary: {
        DEFAULT: '#64cc96'
      }
    }
  },
  presets: [
    presetUno(),
    presetUseful(),
    presetAttributify(),
    presetIcons({
      scale: 1.2
    }),
    presetTypography()
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
})
