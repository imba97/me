import {
  createLocalFontProcessor
} from '@unocss/preset-web-fonts/local'
import { unoColors } from 'uno-colors'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

const breakpoints = {
  'xs': '320px',
  'sm': '480px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1920px'
}

export default defineConfig({
  theme: {
    colors: unoColors({
      primary: '#64cc96'
    }),
    breakpoints
  },
  shortcuts: [
    [/^clickable(-.*)?$/, ([, scale]) => `cursor-pointer transition active:scale${scale || '-95'}`],

    ['pr', 'relative'],
    ['pa', 'absolute'],
    ['pf', 'fixed'],
    ['ps', 'sticky'],

    // position layout
    ['pxc', 'pa left-1/2 -translate-x-1/2'],
    ['pyc', 'pa top-1/2 -translate-y-1/2'],
    ['pcc', 'pxc pyc'],

    // flex layout
    ['fcc', 'flex justify-center items-center'],
    ['fccc', 'fcc flex-col'],
    ['fxc', 'flex justify-center'],
    ['fyc', 'flex items-center'],
    ['fs', 'flex justify-start'],
    ['fsc', 'flex justify-start items-center'],
    ['fse', 'flex justify-start items-end'],
    ['fe', 'flex justify-end'],
    ['fec', 'flex justify-end items-center'],
    ['fb', 'flex justify-between'],
    ['fbc', 'flex justify-between items-center'],
    ['fa', 'flex justify-around'],
    ['fac', 'flex justify-around items-center'],
    ['fw', 'flex justify-wrap'],
    ['fwr', 'flex justify-wrap-reverse']
  ],
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      cdn: 'https://esm.sh/',
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'text-bottom'
      }
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter'
      },
      processors: createLocalFontProcessor()
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
})
