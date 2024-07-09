<script lang="ts" setup>
import OpenSourceProjects from './OpenSourceProjects.vue'
</script>

<template>
  <div class="main" h-full w-full px-7 py-10 of-x-hidden>
    <div prose ma font-ma>
      <div mb-6 flex items-center gap-4>
        <div h-12 w-12>
          <img src="/favicon.png" rounded-full>
        </div>
        <div text-8 font-bold>
          imba久期
        </div>
      </div>

      <div text-gray>
        Hello 各位好，我是 imba久期
      </div>

      <div mt-6>
        <p>一个前端，开源爱好者，自建服务狂热者，面向生活编程，用技术解决生活中的问题，喜欢研究、总结、分享</p>
      </div>

      <div mt-6>
        <div font-bold>
          工作项目
        </div>

        <ul>
          <li>淘宝小程序商家助手，独立开发跨境电商应用跨境助手，封装小程序 WebView 通讯机制、开发可视化打印模板编辑器</li>
          <li>点餐屏跨端应用开发，皮爷咖啡、赛百味、泸溪河，调研并对接打印机、电子秤、副屏、读卡器、支付 POS 机等硬件设备</li>
        </ul>
      </div>

      <div mt-6>
        <div font-bold>
          开源项目
        </div>

        <div mt-2>
          <OpenSourceProjects />
        </div>
      </div>

      <div mt-6>
        <div font-bold>
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
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
