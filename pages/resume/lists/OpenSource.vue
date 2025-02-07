<template>
  <BaseList>
    <li>
      <div>
        <span>更方便的脚本引擎</span>
        <IxIconText
          :preset="IconTextPreset.Initx" icon-class="i-mdi-github bg-[#f4cb25] size-5.5!"
          href="https://github.com/initx-collective/initx"
        >
          initx
        </IxIconText>
        <span>提供强大的匹配器和插件系统，让脚本开发更简单。提供插件起步模板</span>
        <IxIconText :preset="IconTextPreset.Github" href="initx-collective/initx-plugin-starter">
          initx-plugin-starter
        </IxIconText>
        <span>详情可查看</span>
        <IxIconText :preset="IconTextPreset.Bilibili" href="BV18d1sYrEiU">
          介绍视频
        </IxIconText>
      </div>
    </li>

    <li>
      <div>
        <span>免安装脚本</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/iconfontx">
          iconfontx
        </IxIconText>
        <span>，将 iconfont 的图标生成一个 CSS 文件在本地使用的，自动拉取样式和字体、自动转 base64、自动压缩样式文件</span>
      </div>
    </li>

    <li>
      <div>
        <div>
          <span>可以通过串口发送短信的</span>
          <IxIconText :preset="IconTextPreset.Github" href="smserialport/smserialport">
            SMSerialport
          </IxIconText>
          <span>。实现了中国大陆地区手机号发送短信，封装了适配器接口，可通过实现适配器对接更多国家或地区的发信逻辑</span>
        </div>

        <div>
          <span>并写了一个 Electron 的应用</span>
          <IxIconText :preset="IconTextPreset.Github" href="smserialport/smserialport-electron">
            smserialport-electron
          </IxIconText>
        </div>
      </div>
    </li>

    <li>
      <div>
        <span>自动引入 Lodash 的</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/lodash-imports">
          lodash-imports
        </IxIconText>
        <span>，配合自动引入插件使用，可以配置过滤、前缀。</span>
        <span>内置 Lodash 库，无需额外安装，可以在自动引入插件外使用 Lodash 的函数</span>
      </div>
    </li>

    <li>
      <div>
        <span>定制个人简介</span>
        <IxIconText :preset="IconTextPreset.Github" href="introxd/web">
          Intro XD
        </IxIconText>
        <span>，个人付费定制简介项目。在做项目时有一些不错的组件，单独抽出来做了</span>
        <IxIconText :preset="IconTextPreset.Github" href="introxd/components">
          组件库
        </IxIconText>
      </div>
    </li>

    <li>
      <div>
        <span>饥荒联机版菜谱速查工具</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/dst-recipe">
          dst-recipe
        </IxIconText>
        <span>，通过菜谱名称或拼音查询制作条件，可以在这里使用</span>
        <IxIconText icon-class="i-material-symbols-light-document-search-outline size-5.5!" href="https://dst-recipe.netlify.app/">
          菜谱速查
        </IxIconText>
      </div>
    </li>

    <li>
      <div>
        <span>一个以优化 B站 功能为主的浏览器插件</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/btools">
          Btools
        </IxIconText>
        <span>，多账号切换、快速打开封面、找回失效视频等功能，后来使用 Vue 重构写了</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/btools-vue">
          Btools-vue
        </IxIconText>
        <span>，不过目前 B站 改了接口，部分功能不能用了。准备继续重构</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/btools-vitesse">
          Btools-vitesse
        </IxIconText>
      </div>
    </li>

    <li>
      <div>
        <span>蓝天救援队管理系统</span>
        <IxIconText :preset="IconTextPreset.Github" href="bsr-project">
          bsr-project
        </IxIconText>
        <span>，包含用户端、服务端、后台管理、官网。功能有人员管理、任务管理、签到签退、导出表格等。前端 Vue 3，后端 Nestjs，数据库 MySQL</span>
      </div>
    </li>
  </BaseList>
</template>

<script lang="ts" setup>
import BaseList from './BaseList.vue'
</script>
