<script lang="ts" setup>
import TechnologyStack from './lists/TechnologyStack.vue'
import Company from './lists/Company.vue'
import OpenSource from './lists/OpenSource.vue'
import Gadgets from './lists/Gadgets.vue'
import BlogArchives from './lists/BlogArchives.vue'
import Pages from './lists/Pages.vue'
</script>

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
