<script lang="ts" setup>
const props = defineProps<{
  iconClass: string
  href?: string
}>()

function onClick() {
  if (props.href) {
    window.open(props.href, '_blank')
  }
}
</script>

<template>
  <div
    class="icon-text" :class="[
      props.href ? 'cursor-pointer hover:bg-[rgba(0,0,0,0.2)] active:scale-95' : '',
    ]" mx="0.5" px-2 py-1 rounded-2 flex items-center justify-center gap-1 flex-inline transition="all duration-300"
    box-border @click="onClick"
  >
    <div :class="props.iconClass" />
    <div select-none>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
