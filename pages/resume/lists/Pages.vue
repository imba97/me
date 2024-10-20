<template>
  <BaseList>
    <li>
      <div>
        <IconText icon-class="i-ph-music-note-simple-duotone h-5 w-5" href="/playing">
          我正在听的音乐
        </IconText>
      </div>
    </li>

    <li>
      <div>
        <IconText src="https://introxd.com/favicon.png" icon-class="size-5" href="https://introxd.com">
          Introxd 定制个人简介
        </IconText>
      </div>
    </li>

    <li>
      <div>
        <IconText src="https://introxd.com/favicon.png" icon-class="size-5" href="https://docs.introxd.com">
          Introxd 组件库
        </IconText>
      </div>
    </li>
  </BaseList>
</template>

<script lang="ts" setup>
import BaseList from './BaseList.vue'
</script>
