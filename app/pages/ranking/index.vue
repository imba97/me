<template>
  <div size-full px-7 py-10 of-x-hidden>
    <div ma max-w-4xl>
      <div mb-6 flex="~" items-center gap-2>
        <NuxtLink to="/resume" text-gray-5 hover:text-gray-9 transition i-carbon-arrow-left />
        <div text-6 font-bold>
          个人从夯到拉排行榜
        </div>
      </div>

      <div flex="~ col" gap-3>
        <NuxtLink
          v-for="item in rankings"
          :key="item.id"
          :to="item.path"
          flex="~"
          items-center
          justify-between
          p-4
          bg-white
          rounded-8
          b="1 gray-200"
          hover="b-[#bd34fe] shadow-lg"
          transition-all
          cursor-pointer
        >
          <span text-4 text-gray-9>{{ item.name }}</span>
          <span text-gray-5 i-carbon-chevron-right />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface RankingItem {
  id: string
  name: string
  path: string
}

const rankings: RankingItem[] = [
  { id: '1', name: '动漫', path: '/ranking/animation' },
  { id: '2', name: '瑞幸咖啡', path: '/ranking/luckin-coffee' }
]
</script>
