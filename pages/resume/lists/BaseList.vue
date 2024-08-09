<style lang="scss" scoped>
.common-list {
  :deep(li) {
    &+li {
      --uno: mt-4;
    }

    &>div {
      .icon-text {
        --uno: relative top-0.58;
      }
    }

  }
}
</style>

<template>
  <ul class="common-list">
    <slot />
  </ul>
</template>
