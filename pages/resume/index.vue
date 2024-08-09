<template>
  <div class="main" h-full w-full px-7 py-10 of-x-hidden>
    <div prose ma font-ma>
      <div mb-6 flex items-center gap-4>
        <div h-14 w-14>
          <img src="/favicon.png">
        </div>
        <div text-8 font-thin bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe" to="#47caff">
          imba久期
        </div>

        <div v-show="music.playing">
          <VMenu
            :distance="16" :skidding="isMobile ? 0 : 100" :triggers="['hover', 'click']"
            :placement="isMobile ? undefined : 'right'"
          >
            <div i-ph-music-note-simple-duotone h-6 w-6 animate-pulse bg-gradient-to-tr from="#bd34fe" to="#47caff" />

            <template #popper>
              <div relative p-3 max-w-64 of-hidden>
                <div absolute top-0 left-0 w-full blur-16>
                  <img :src="music.image" h-24 w-full>
                </div>

                <div mt-6 flex="~ col" items-center justify-center text-center>
                  <div flex="~ col" items-center gap-2>
                    <div v-if="music.image !== ''">
                      <img :src="music.image" h-32 w-32 rounded-full animate-spin animate-duration-30000>
                    </div>
                  </div>

                  <div mt-5 text="4 gray">
                    我正在听
                  </div>

                  <div mt-2 text-6>
                    <div
                      p-2 break-all font-bold bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe"
                      to="#47caff"
                    >
                      {{ music.name }} - {{ music.artist }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </VMenu>
        </div>
      </div>

      <div text-gray>
        Hello 各位好，我是 imba久期
      </div>

      <div mt-4>
        <p>
          一个前端，开源爱好者，自建服务狂热者，面向生活编程，用技术解决生活中的问题，喜欢研究、总结、分享
        </p>
      </div>

      <div mt-8>
        <div flex items-baseline gap-2>
          <div text-6 font-bold>
            技术栈
          </div>
          <div text="3.2 gray">
            按熟练度排序
          </div>
        </div>
        <div mt-2>
          <TechnologyStack />
        </div>
      </div>

      <div mt-8>
        <div text-6 font-bold>
          工作项目
        </div>

        <div mt-2>
          <Company />
        </div>
      </div>

      <div mt-8>
        <div text-6 font-bold>
          开源项目
        </div>

        <div mt-2>
          <OpenSource />
        </div>
      </div>

      <div mt-8>
        <div text-6 font-bold>
          小玩意儿
        </div>

        <div mt-2>
          <Gadgets />
        </div>
      </div>

      <div mt-8>
        <div text-6 font-bold>
          页面
        </div>

        <div mt-2>
          <Pages />
        </div>
      </div>

      <div mt-8>
        <div text-6 font-bold>
          博客文章
        </div>

        <div mt-2>
          <BlogArchives />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { find, get } from 'lodash-es'

import TechnologyStack from './lists/TechnologyStack.vue'
import Company from './lists/Company.vue'
import OpenSource from './lists/OpenSource.vue'
import Gadgets from './lists/Gadgets.vue'
import BlogArchives from './lists/BlogArchives.vue'
import Pages from './lists/Pages.vue'

const music = reactive({
  playing: false,
  name: '',
  artist: '',
  image: ''
})

let requestTimer: NodeJS.Timeout | null = null

const windowWidth = ref(0)

const isMobile = computed(() => windowWidth.value < 670)

onNuxtReady(async () => {
  getMusic()

  requestTimer = setInterval(() => {
    getMusic()
  }, 10000)
})

onMounted(() => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)

  if (requestTimer) {
    clearInterval(requestTimer)
    requestTimer = null
  }
})

function onResize() {
  windowWidth.value = window.innerWidth
}

// TODO: 抽成工具函数
async function getMusic() {
  const response = await useFetch('/api/playing')

  if (!response || !response.data.value) {
    return
  }

  const data = response.data.value

  const name = get(data, 'name')
  const artist = get(data, 'artist.#text')

  if (!name || !artist) {
    return
  }

  music.name = name
  music.artist = artist

  music.playing = get(data, '@attr.nowplaying') === 'true'

  music.image = get(data, 'albumCover', '')

  if (music.image === '') {
    music.image = get(find(get(data, 'image'), { size: 'extralarge' }), '#text')!
  }
}
</script>
