<template>
  <RankingTemplate title="动漫" :rankings="rankings" />
</template>

<script lang="ts" setup>
import type { Rankings } from 'h2l-ranking'

const image = useImage()

const rankings: Rankings = {
  hang: [
    {
      title: '《中二病也要谈恋爱》',
      description: '本人入宅作，给到一个夯',
      cover: image('/assets/images/ranking/animation/cyu-2-byo-demo-koi-ga-shitai.jpg'),
      url: 'https://www.bilibili.com/bangumi/play/ss4340'
    },
    { title: '《玉子爱情故事》', cover: image('/assets/images/ranking/animation/tamako-love-story.jpg') },
    { title: '《葬送的芙莉莲》', cover: image('/assets/images/ranking/animation/frieren.jpg') },
    {
      title: '《我心里危险的东西》',
      description: '心理描写细腻，适合我们死宅体质',
      cover: image('/assets/images/ranking/animation/the-dangers-in-my-heart.jpg')
    },
    { title: '《双城之战》', cover: image('/assets/images/ranking/animation/arcane.jpg'), description: '金克斯牛逼！' }
  ],
  upper: [
    { title: '《搞笑漫画日和》', cover: image('/assets/images/ranking/animation/gag-manga-biyori.jpg') },
    { title: '《胆大党》', cover: image('/assets/images/ranking/animation/dan-da-dan.jpg') },
    { title: '《荒川爆笑团》', cover: image('/assets/images/ranking/animation/arakawa-under-the-bridge.jpg') },
    { title: '《银魂》', cover: image('/assets/images/ranking/animation/gintama.jpg') },
    { title: '《某科学的超电磁炮》', cover: image('/assets/images/ranking/animation/a-certain-scientific-railgun.jpg') },
    { title: '《魔法禁书目录》', cover: image('/assets/images/ranking/animation/to-aru-majutsu-no-index.jpg') },
    { title: '《热带雨林的爆笑生活》', cover: image('/assets/images/ranking/animation/har-guu.jpg') }
  ],
  middle: [],
  lower: [],
  la: []
}
</script>
