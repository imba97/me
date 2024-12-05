<style lang="scss" scoped>
.name-container {
  --slice-0: inset(50% 50% 50% 50%);
  --slice-1: inset(15% 0 65% 3px);
  --slice-2: inset(30% 3px 40% 5px);
  --slice-3: inset(50% 0 35% 12px);
  --slice-4: inset(60% 6px 30% 0);
  --slice-5: inset(70% 0 10% 0);

  --slice-shadow-1: -1px -1px 0 #F8F005, 1px 1px 0 #00E6F6;
  --slice-shadow-2: -2px -2px 0 #F8F005, 2px 2px 0 #00E6F6;

  .name {
    &::before {
      content: "imba久期";
      --uno: font-thin bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe" to="#47caff";
      --uno: pa top-0 right-0 bottom-0 left-0;

      text-shadow: var(--slice-shadow-1);

      clip-path: var(--slice-0);
    }

    &::after {
      content: "imba久期";
      --uno: font-thin bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe" to="#47caff";
      --uno: pa top-0 right-0 bottom-0 left-0 blur-2;

      text-shadow: var(--slice-shadow-1);

      clip-path: var(--slice-0);
    }

    &.animate-glitch {

      &::before,
      &::after {
        animation: glitch .6s infinite steps(2, end);
      }
    }
  }
}

@keyframes glitch {
  0% {
    clip-path: var(--slice-1);
    transform: translate(10px, 5px);
  }

  20% {
    clip-path: var(--slice-5);
    transform: translate(-10px, -6px);
  }

  40% {
    clip-path: var(--slice-3);
    transform: translate(8px, -12px);
  }

  60% {
    clip-path: var(--slice-4);
    transform: translate(-8px, 5px);
    text-shadow: var(--slice-shadow-2);
  }

  80% {
    clip-path: var(--slice-5);
    transform: translate(15px, 12px);
  }

  100% {
    clip-path: var(--slice-1);
    transform: translate(-15px, -5px);
    text-shadow: var(--slice-shadow-2);
  }
}
</style>

<template>
  <div class="name-container" pr text-8>
    <div
      class="name" :class="hasAnimate ? 'animate-glitch' : ''" font-thin bg-clip-text text-transparent
      bg-gradient-to-tr from="#bd34fe" to="#47caff"
    >
      imba久期
    </div>
    <div pa top-0 right-0 bottom-0 left-0 bg-gradient-to-tr from="#bd34fe" to="#47caff" blur-lg op-30 />
  </div>
</template>

<script lang="ts" setup>
const hasAnimate = ref(false)

onMounted(() => {
  playAnimate()
})

async function playAnimate() {
  hasAnimate.value = true

  const playTime = _random(200, 1200)

  await new Promise((resolve) => {
    setTimeout(() => {
      hasAnimate.value = false
      resolve(null)
    }, playTime)
  })

  const interval = _random(2000, 5000)
  setTimeout(() => {
    playAnimate()
  }, interval)
}
</script>
