<style lang="scss" scoped>
.common-list {
  :deep(li) {
    &+li {
      --uno: mt-4;
    }

    &>div {
      div {
        --uno: inline-block;
      }

      .ix-icon-text {
        --uno: px-2 space-x-1;

        img {
          --uno: m-0 inline;
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
