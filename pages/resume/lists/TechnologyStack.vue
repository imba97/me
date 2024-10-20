<template>
  <div>
    <div flex="~ wrap">
      <IconText v-for="item in list" :key="item.text" :font-preset="IconTextFont.None" :icon-class="item.icon">
        {{ item.text }}
      </IconText>
    </div>
  </div>
</template>

<script lang="ts" setup>
const list = [
  { icon: 'i-logos-typescript-icon', text: 'TypeScript' },
  { icon: 'i-logos-vue', text: 'Vue' },
  { icon: 'i-logos-nodejs-icon-alt', text: 'Node' },
  { icon: 'i-logos-nuxt-icon', text: 'Nuxt' },
  { icon: 'i-logos-capacitorjs-icon', text: 'Capacitor' },
  { icon: 'i-logos-electron', text: 'Electron' },
  { icon: 'i-logos-docker-icon h-6 w-6', text: 'Docker' },
  { icon: 'i-logos-angular-icon', text: 'Angular' },
  { icon: 'i-logos-nestjs', text: 'Nest' },
  { icon: 'i-logos-react', text: 'React' },
  { icon: 'i-logos-php h-8 w-8', text: 'PHP' },
  { icon: 'i-logos-unity', text: 'Unity 3D' },
  { icon: 'i-logos-c-sharp', text: 'C#' },
  { icon: 'i-logos-swift', text: 'Swift' },
  { icon: 'i-material-symbols-more-horiz', text: '想到再加' }
]
</script>
