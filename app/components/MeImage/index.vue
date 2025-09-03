<template>
  <div v-if="hasImage">
    <NuxtImg
      v-show="!loading"
      v-bind="attrs"
      :src="props.src"
      @load="loading = false"
      @error="loading = false"
    />
    <div v-show="loading && !props.hiddenLoading" v-bind="attrs" fcc>
      <div i-line-md-loading-loop size="25%" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  src?: string
  hiddenLoading?: boolean
}>(), {
  src: '',
  hiddenLoading: false
})

const attrs = useAttrs()

const loading = ref(true)

const hasImage = computed(() => {
  return props.src !== ''
})
</script>
