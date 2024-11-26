<template>
  <div class="main" size-full px-7 py-10 of-x-hidden>
    <div prose ma>
      <div mb-6 fyc gap-4>
        <div size-14>
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
            <div i-ph-music-note-simple-duotone size-6 animate-pulse bg-gradient-to-tr from="#bd34fe" to="#47caff" />

            <template #popper>
              <div relative p-3 min-w-56 max-w-64 of-hidden>
                <div absolute top-0 left-0 w-full blur-16>
                  <img v-show="music.image !== ''" :src="music.image" h-24 w-full>
                </div>

                <div mt-6 fccc text-center>
                  <div flex="~ col" items-center gap-2>
                    <div fcc size-32>
                      <img
                        v-if="imageLoaded && music.image !== ''" :src="music.image" rounded-full animate-spin
                        animate-duration-30000
                      >
                      <div v-else i-line-md-loading-loop size-12 bg-gray />
                    </div>
                  </div>

                  <div mt-5 text="4 gray">
                    我正在听
                  </div>

                  <div mt-2>
                    <div
                      p-2 break-all text-8 font-bold bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe"
                      to="#47caff"
                    >
                      {{ music.name }}
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
import BlogArchives from './lists/BlogArchives.vue'
import Company from './lists/Company.vue'
import Gadgets from './lists/Gadgets.vue'
import OpenSource from './lists/OpenSource.vue'
import Pages from './lists/Pages.vue'
import TechnologyStack from './lists/TechnologyStack.vue'

const music = reactive({
  playing: false,
  name: '',
  artist: '',
  image: ''
})

const imageLoaded = ref(false)

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

async function getMusic() {
  const response = await useFetch('/api/playing')

  if (!_get(response.data.value, 'success')) {
    return
  }

  const data = response.data.value!.data!

  if (!data.name || !data.artist) {
    return
  }

  music.name = data.name
  music.artist = data.artist

  music.playing = data.playing

  if (data.albumCover && data.albumCover !== music.image) {
    imageLoaded.value = false

    useLoadImage(data.albumCover).then(() => {
      music.image = data.albumCover!
      imageLoaded.value = true
    }).catch(() => {
      imageLoaded.value = false
      music.image = ''
    })
  }
}
</script>
