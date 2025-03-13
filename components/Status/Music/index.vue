<template>
  <div v-show="music.playing">
    <VMenu
      :distance="16" :skidding="isMobileSize ? 0 : 100" :triggers="['hover', 'click']"
      :placement="isMobileSize ? undefined : 'right'"
    >
      <div i-ph-music-note-simple-duotone size-6 animate-pulse bg-gradient-to-tr from="#bd34fe" to="#47caff" />

      <template #popper>
        <div relative p-3 w-58 of-hidden>
          <div absolute top-0 left-0 w-full blur-16>
            <img v-show="music.blobImage !== ''" :src="music.blobImage" h-24 w-full>
          </div>

          <div mt-6 fccc text-center>
            <div flex="~ col" items-center gap-2>
              <div fcc size-32>
                <img
                  v-if="music.imageLoaded && music.image !== ''" :src="music.image" rounded-full animate-spin
                  animate-duration-30000
                >
                <div v-else i-line-md-loading-loop size-12 bg-gray />
              </div>
            </div>

            <div mt-5 text="4 gray">
              我正在听
            </div>

            <div mt-2>
              <div p-2>
                <Text
                  v-show="music.name !== ''"
                  w-58 text-class="text-8 font-bold bg-clip-text text-transparent bg-gradient-to-tr from-[#bd34fe]
                      to-[#47caff]"
                >
                  {{ music.name }}
                </Text>
                <div v-show="music.name === ''" i-line-md-loading-loop size-6 bg-gray-3 />
              </div>
              <div text="3.5 gray-3">
                {{ music.artist }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VMenu>
  </div>
</template>

<script lang="ts" setup>
const music = useMusic()
const { isMobileSize } = useMobileSize()
</script>
