<style lang="scss" scoped>
.common-list {
  :deep(li) {
    --uno: leading-8;

    &+li {
      --uno: mt-4;
    }

    &>div {
      .ix-icon-text {
        --uno: relative top-0.58 p-2;

        &>div:nth-child(1) {
          --uno: size-4.5;
        }

        &>div:nth-child(2) {
          --uno: leading-none pr top-0.2;
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
