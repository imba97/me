<script lang="ts" setup>
import Company from './lists/Company.vue'
import OpenSource from './lists/OpenSource.vue'
import Gadgets from './lists/Gadgets.vue'
import BlogArchives from './lists/BlogArchives.vue'
</script>

<template>
  <div class="main" h-full w-full px-7 py-10 of-x-hidden>
    <div prose ma font-ma>
      <div mb-6 flex items-center gap-4>
        <div h-12 w-12>
          <img src="/favicon.png" rounded-full>
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
          博客文章
        </div>

        <div mt-2>
          <BlogArchives />
        </div>
      </div>

      <div mt-8>
        <div text-6 font-bold>
          技术栈
        </div>
        <div mt-2 flex="~ wrap">
          <IconText icon-class="i-logos-typescript-icon">
            TypeScript
          </IconText>

          <IconText icon-class="i-logos-vue">
            Vue
          </IconText>

          <IconText icon-class="i-logos-angular-icon">
            Angular
          </IconText>

          <IconText icon-class="i-logos-capacitorjs-icon">
            Capacitor
          </IconText>

          <IconText icon-class="i-logos-nestjs">
            Nest
          </IconText>

          <IconText icon-class="i-logos-docker-icon h-6 w-6">
            Docker
          </IconText>

          <IconText icon-class="i-logos-typeorm">
            TypeORM
          </IconText>
        </div>
      </div>
    </div>
  </div>
</template>
