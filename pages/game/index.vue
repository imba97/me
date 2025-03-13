<style lang="scss" scoped>
.game-text {
  :deep() {
    span {
      @supports (-webkit-background-clip: text) or (background-clip: text) {
        background: linear-gradient(90deg, #1062af 0%, #7828be 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    }
  }
}
</style>

<template>
  <div h-full w-full of-hidden>
    <div h-full w-full flex="~ col" items-center justify-center>
      <div
        p-10 lt-md="w-[90%]" md="w-[60%]" flex="~ col" items-center justify-center gap-2 rounded-10
        :class="steam.imageLoaded ? 'bg-[rgba(255,255,255,0.35)]' : 'bg-[rgba(0,0,0,0.35)]'"
      >
        <div text="gray-6 lt-md:6 md:8">
          {{ steam.playing ? '我正在玩' : '当前没在玩游戏' }}
        </div>
        <div
          lt-md="h-48 w-48" md="h-86 w-86" my-4 rounded-full of-hidden
        >
          <img v-show="steam.imageLoaded" :src="steam.blobBackground" size-full object-cover animate-fade-in>
          <div v-show="!steam.imageLoaded" i-mdi-steam size-full bg-dark-1 />
        </div>
        <Text
          v-show="steam.playing"
          :class="{
            'game-text': steam.imageLoaded
          }" text="gray-6 center lt-md:8 md:12" w-full h="lt-md:12 md:22" font-bold
        >
          {{ steam.name }}
        </Text>
      </div>
    </div>

    <div fixed top="-10%" left="-10%" h="120%" w="120%" z--1 blur-32>
      <img
        v-show="steam.imageLoaded" :src="steam.blobBackground" h-full w-full object-cover select-none animate-fade-in
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
const steam = useSteam()
</script>
