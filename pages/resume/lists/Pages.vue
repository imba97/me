<script lang="ts" setup>
import BaseList from './BaseList.vue'
</script>

<template>
  <BaseList>
    <li>
      <div>
        <IconText
          icon-class="i-ph-music-note-simple-duotone h-5 w-5" font-class="font-bold b-b-1 b-b-dashed"
          href="/playing"
        >
          我正在听的音乐
        </IconText>
      </div>
    </li>
  </BaseList>
</template>
