<style scoped>
.lighting-text {
  --lighting-size: 200px;

  background-image: radial-gradient(#A9A9A9, #4A4A4A, #4A4A4A);
  background-size: var(--lighting-size) var(--lighting-size);
  background-repeat: no-repeat;
  background-color: #4A4A4A;
  background-position-x: calc(var(--x) - var(--positionX) - calc(var(--lighting-size) / 2));
  background-position-y: calc(var(--y) - var(--positionY) - calc(var(--lighting-size) / 2));
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}
</style>

<template>
  <div pr class="lighting-text">
    <slot />
  </div>
</template>

<script lang="ts" setup>
// 需要在全局注册，目前不考虑启用本组件，只在此保留
onMounted(() => {
  document.body.addEventListener('mousemove', (e) => {
    document.body.style.setProperty('--x', `${e.clientX}px`)
    document.body.style.setProperty('--y', `${e.clientY}px`)
  })

  setLinksPositions()
  window.addEventListener('resize', setLinksPositions)
})

onUnmounted(() => {
  window.removeEventListener('resize', setLinksPositions)
})

function setLinksPositions() {
  document.querySelectorAll<HTMLDivElement>('.lighting-text').forEach((div) => {
    const bounding = div.getBoundingClientRect()
    div.style.setProperty('--positionX', `${bounding.x}px`)
    div.style.setProperty('--positionY', `${bounding.y}px`)
  })
}
</script>
