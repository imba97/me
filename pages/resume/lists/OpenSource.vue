<template>
  <BaseList>
    <li>
      <div>
        <div>
          <span>可以通过串口发送短信的</span>
          <IconText
            icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
            href="https://github.com/smserialport/smserialport"
          >
            SMSerialport
          </IconText>
          <span>，使用 Monorepo 管理项目。实现了中国大陆地区手机号发送短信，封装了适配器接口，可通过实现适配器对接更多国家或地区的发信逻辑</span>
        </div>

        <div>
          <span>并写了一个 Electron 的应用</span>
          <IconText
            icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
            href="https://github.com/smserialport/smserialport-electron"
          >
            smserialport-electron
          </IconText>
        </div>
      </div>
    </li>

    <li>
      <div>
        <span>免安装脚本</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/imba97/iconfontx"
        >
          iconfontx
        </IconText>
        <span>，将 iconfont 的图标生成一个 CSS 文件在本地使用的，自动拉取样式和字体、自动转 base64、自动压缩样式文件</span>
      </div>
    </li>

    <li>
      <div>
        <span>自动引入 Lodash 的</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/imba97/lodash-imports"
        >
          lodash-imports
        </IconText>
        <span>，配合自动引入插件使用，可以配置过滤、前缀。</span>
        <span>内置 Lodash 库，无需额外安装，可以在自动引入插件外使用 Lodash 的函数</span>
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

    <li>
      <div>
        <span>蓝天救援队管理系统</span>
        <IconText
          icon-class="i-logos-github-icon translate-y-0.2" font-class="font-bold b-b-1 b-b-dashed"
          href="https://github.com/bsr-project"
        >
          bsr-project
        </IconText>
        <span>，包含用户端、服务端、后台管理、官网。功能有人员管理、任务管理、签到签退、导出表格等。前端 Vue 3，后端 Nestjs，数据库 MySQL</span>
      </div>
    </li>
  </BaseList>
</template>

<script lang="ts" setup>
import BaseList from './BaseList.vue'
</script>
