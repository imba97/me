import { unoColors } from 'uno-colors'

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  type PresetOrFactoryAwaitable,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

import { presetUseful } from 'unocss-preset-useful'

export default defineConfig({
  theme: {
    colors: unoColors({
      primary: '#64cc96'
    })
  },
  presets: [
    presetUno(),
    presetUseful() as PresetOrFactoryAwaitable<object>,
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
