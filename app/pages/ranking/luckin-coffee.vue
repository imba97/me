<template>
  <RankingTemplate title="瑞幸咖啡" :rankings="rankings" />
</template>

<script lang="ts" setup>
import type { Rankings } from 'h2l-ranking'

const image = useImage()

const rankings: Rankings = {
  hang: [
    {
      title: '周边-线条小狗',
      description: '本人太吃线条小狗这画风了，而且金属材质，直接给到夯',
      cover: image('/assets/images/ranking/luckin-coffee/co-brand-maltese.png')
    }
  ],
  upper: [],
  middle: [],
  lower: [],
  la: []
}
</script>
