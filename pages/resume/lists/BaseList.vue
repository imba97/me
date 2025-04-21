<style lang="scss" scoped>
.common-list {
  :deep(li) {
    --uno: leading-8;

    &+li {
      --uno: mt-4;
    }

    &>div {
      .ix-icon-text {
        --uno: pr top-0.5 p-2;

        &>div:nth-child(1) {
          --uno: size-4.6;
        }

        &>div:nth-child(2) {
          --uno: leading-none;
        }
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
