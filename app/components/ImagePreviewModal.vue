<template>
  <Teleport to="body">
    <div
      fixed inset-0 z-50 flex items-center justify-center bg="black/70" p-8
      @click.self="emit('close')"
    >
      <div class="relative">
        <img
          :src="src"
          alt="图片预览"
          max-w-full max-h-full rounded object-contain
        >
        <div class="absolute top-2 right-2 flex gap-2">
          <button
            type="button"
            aria-label="删除图片"
            size-10 flex items-center justify-center rounded-full bg="black/50" text-white
            hover="bg-black/70" transition-colors
            @click="emit('delete')"
          >
            <div class="i-carbon-trash-can text-lg" />
          </button>
          <button
            type="button"
            aria-label="关闭预览"
            size-10 flex items-center justify-center rounded-full bg="black/50" text-white
            hover="bg-black/70" transition-colors
            @click="emit('close')"
          >
            <div class="i-carbon-close text-lg" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  src: string
}>()

const emit = defineEmits<{
  close: []
  delete: []
}>()
</script>
