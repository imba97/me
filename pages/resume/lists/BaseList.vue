<style lang="scss" scoped>
.common-list {
  :deep(li) {
    --uno: leading-7.5;

    &+li {
      --uno: mt-4;
    }

    &>div {
      .ix-icon-text {
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
