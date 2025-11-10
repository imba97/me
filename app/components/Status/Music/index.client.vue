<style lang="scss" scoped>
.music-text {
  :deep() {
    span {
      @supports (-webkit-background-clip: text) or (background-clip: text) {
        background: linear-gradient(90deg, #8ec6fa 0%, #d09bff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    }
  }
}
</style>

<template>
  <div v-show="music.playing">
    <VMenu
      :distance="16" :skidding="isMobileSize ? 0 : 100" :triggers="['hover', 'click']"
      :placement="isMobileSize ? undefined : 'right'"
    >
      <div size-6 animate-fade-in>
        <div i-ph-music-note-simple-duotone size-full animate-pulse bg-gradient-to-tr from="#bd34fe" to="#47caff" />
      </div>

      <template #popper>
        <div relative w-58 of-hidden>
          <div>
            <div absolute inset-0 py-6 size-full blur-16 bg-gray bg-opacity-50 z--1>
              <MeImage
                :src="music.image" hidden-loading absolute size="110%"
                top="50%" left="50%" translate="-50%"
                object-cover animate-fade-in
              />
            </div>
          </div>

          <div fccc text-center>
            <div py-8 flex="~ col" items-center gap-2>
              <div shrink-0 fcc size-32 animate-fade-in>
                <MeImage
                  :src="music.image"
                  size-full
                  rounded-full
                  animate-spin
                  animate-duration-30000
                />
              </div>
            </div>

            <div p-3 bg-black bg-opacity-50>
              <div text="4 white">
                我正在听
              </div>

              <div py-2>
                <Text
                  v-show="music.name !== ''"
                  w-54
                  text-class="text-8 text-white font-bold"
                  class="music-text"
                >
                  {{ music.name }}
                </Text>
                <div v-show="music.name === ''" i-line-md-loading-loop size-6 bg-gray-3 />
              </div>

              <div text="3.5 gray-3" class="music-text">
                <span>{{ music.artist }}</span>
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
