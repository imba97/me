<template>
  <RankingTemplate title="瑞幸咖啡" :rankings="rankings" />
</template>

<script lang="ts" setup>
import type { Rankings } from 'h2l-ranking'

const image = useImage()

const rankings: Rankings = {
  hang: [
    {
      title: '橙C美式',
      description: '《一旦接受了这种设定》',
      cover: image('/assets/images/ranking/luckin-coffee/orange-americano-coffee.png')
    },
    {
      title: '生椰拿铁',
      description: '丝滑，丝滑，还是丝滑',
      cover: image('/assets/images/ranking/luckin-coffee/coconut-latte.png')
    },
    {
      title: '周边-线条小狗',
      description: '本人太吃线条小狗这画风了，而且金属材质，直接给到夯',
      cover: image('/assets/images/ranking/luckin-coffee/co-brand-maltese.png')
    }
  ],
  upper: [
    {
      title: '羽衣轻体果蔬茶',
      description: '感觉就很健康',
      cover: image('/assets/images/ranking/luckin-coffee/collard-tea.png')
    }
  ],
  middle: [
    {
      title: '柠C美式',
      cover: image('/assets/images/ranking/luckin-coffee/lemon-americano-coffee.png')
    }
  ],
  lower: [],
  la: [
    {
      title: '葡萄冰萃美式',
      description: '这么说吧，带气苏打水、崂山白花蛇草水',
      cover: image('/assets/images/ranking/luckin-coffee/grape-americano-coffee.png')
    }
  ]
}
</script>
