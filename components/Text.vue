<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const marquee = ref<HTMLDivElement | null>(null)
const text = ref<HTMLSpanElement | null>(null)

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
</script>

<template>
  <div ref="marquee" class="marquee" of-hidden>
    <span ref="text">
      <slot />
    </span>
  </div>
</template>

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
