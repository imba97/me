<style lang="scss" scoped></style>

<template>
  <div
    class="icon-text" :class="[
      props.href ? 'cursor-pointer hover:bg-[rgba(0,0,0,0.1)] active:scale-95' : '',
    ]" mx-1 px-2 py-1 rounded-2 flex items-center justify-center gap-1 flex-inline transition="all duration-300"
    box-border @click="onClick"
  >
    <div v-if="isIcon" :class="iconClass" />
    <img v-else :src="props.src" :class="iconClass">

    <div :class="fontClass" select-none>
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  preset?: IconTextPreset
  iconClass?: string
  src?: string
  fontClass?: string
  href?: string
}>()

const isIcon = !props.src

const presetClass = computed(() => {
  switch (props.preset) {
    case IconTextPreset.Github:
      return {
        icon: 'i-logos-github-icon translate-y-0.2',
        font: 'font-bold b-b-1 b-b-dashed'
      }
  }

  return {
    icon: '',
    font: ''
  }
})

const iconClass = computed(() => [props.iconClass, presetClass.value.icon])
const fontClass = computed(() => [props.fontClass, presetClass.value.font])

function onClick() {
  if (!props.href) {
    return
  }

  if (/^https?/.test(props.href)) {
    return props.href
  }

  let presetHref: string | undefined

  switch (props.preset) {
    case IconTextPreset.Github:
      return `https://github.com/${props.href}`
  }

  if (!presetHref) {
    return
  }

  window.open(presetHref, '_blank')
}
</script>
