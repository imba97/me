<style scoped>
.marquee {
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.marquee span.overflow {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 10s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(-100%, 0);
  }
}
</style>

<template>
  <div ref="marquee" class="marquee" of-hidden>
    <span v-if="visible" ref="text" :class="props.textClass">
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const props = defineProps<{
  textClass?: string
}>()

const slots = useSlots()

const visible = ref(true)

const marquee = ref<HTMLDivElement | null>(null)
const text = ref<HTMLSpanElement | null>(null)

watch(() => _get(slots.default?.(), '0.children'), () => {
  reset()
})

onMounted(() => {
  checkOverflow()
})

function checkOverflow() {
  if (!text.value || !marquee.value) {
    return
  }

  if (text.value.offsetWidth > marquee.value.offsetWidth) {
    text.value.classList.add('overflow')
  }
  else {
    text.value.classList.remove('overflow')
  }
}

function reset() {
  if (!text.value) {
    return
  }

  text.value.classList.remove('overflow')

  visible.value = false

  nextTick(() => {
    visible.value = true

    nextTick(() => {
      checkOverflow()
    })
  })
}
</script>
