<template>
  <div v-show="steam.playing">
    <VMenu
      :distance="16" :skidding="isMobileSize ? 0 : 100" :triggers="['hover', 'click']"
      :placement="isMobileSize ? undefined : 'right'"
    >
      <div size-6 animate-fade-in>
        <div i-ph-game-controller size-full animate-pulse bg-gradient-to-tr from="#bd34fe" to="#47caff" />
      </div>

      <template #popper>
        <div pr w-72 of-hidden>
          <div z-10>
            <div py-4 text="4 white center" bg-black bg-opacity-50>
              我正在玩
            </div>

            <div fccc>
              <div flex="~ col" size-full min-h-32 items-center gap-2>
                <div fcc size-full>
                  <MeImage :src="steam.image" size-full />
                </div>
              </div>

              <div w-full bg-black bg-opacity-50 py-2 px-4>
                <div w-full>
                  <Text
                    v-show="steam.name !== ''"
                    w-full text-center text-class="text-8 font-bold text-white"
                  >
                    {{ steam.name }}
                  </Text>
                  <div v-show="steam.name === ''" i-line-md-loading-loop size-6 bg-gray-3 />
                </div>
              </div>
            </div>
          </div>

          <div pa inset-0 z--1>
            <div pa inset-0 blur-16>
              <MeImage :src="steam.image" object-cover h-full />
            </div>
          </div>
        </div>
      </template>
    </VMenu>
  </div>
</template>

<script lang="ts" setup>
const steam = useSteam()
const { isMobileSize } = useMobileSize()
</script>
