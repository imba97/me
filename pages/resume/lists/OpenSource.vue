<script lang="ts" setup>
import BaseList from './BaseList.vue'
</script>

<template>
  <BaseList>
    <li>
      <div>
        <span>可以通过串口发送短信的</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/smserialport/smserialport"
        >
          SMSerialport
        </IconText>
        <span>，使用 Monorepo 管理项目。实现了中国大陆地区手机号发送短信，封装了适配器接口，可通过实现适配器对接更多国家或地区的发信逻辑。</span>

        <span>并写了一个 Electron 的应用</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/smserialport/smserialport-electron"
        >
          smserialport-electron
        </IconText>
      </div>
    </li>

    <li>
      <div>
        <span>一个以优化 B站 功能为主的浏览器插件</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/imba97/btools"
        >
          Btools
        </IconText>
        <span>，多账号切换、快速打开封面、找回失效视频等功能，后来使用 Vue 重构写了</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/imba97/btools-vue"
        >
          Btools-vue
        </IconText>
        <span>，不过目前 B站 改了接口，部分功能不能用了。准备继续重构</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/imba97/btools-vitesse"
        >
          Btools-vitesse
        </IconText>
      </div>
    </li>
  </BaseList>
</template>
