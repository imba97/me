<template>
  <BaseList>
    <li>
      <div>
        <span>写日报太麻烦了，写个</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/imba97_project/tree/master/dingtalk-report-robot">
          钉钉日报机器人
        </IxIconText>
        <span>帮我自动从 Git 整理日报，到点儿了自动推给我。昨天忘了写也没关系，可以指定日期</span>
      </div>
    </li>

    <li>
      <div>
        <span>代码打包传到测试服务器太麻烦了，直接写个</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/simple-sftp-uploader">
          简单的上传器
        </IxIconText>
        <span>打包完自己上传，除了用在 Webpack，也可以直接调用 API</span>
      </div>
    </li>

    <li>
      <div>
        <span>什么？发正式版每次要前端打压缩包发给后端？不行！直接写个</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/simple-zip-upload">
          打包压缩上传工具
        </IxIconText>
        <span>打包后自动压缩 ZIP、上传到服务器、把下载链接推送钉钉，还能自动维护版本。好了，现在压力来到了后端，下班喽！</span>
      </div>
    </li>

    <li>
      <div>
        <span>写博客上传图片 PicGo 真好用，但为什么没有 FTP 上传插件，写了两个插件</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/picgo-plugin-ftp-uploader">
          FTP 插件
        </IxIconText>
        <span>和</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/picgo-plugin-sftp-uploader">
          SFTP 插件
        </IxIconText>
      </div>
    </li>

    <li>
      <div>
        <span>做了几个小游戏</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/games">
          Games
        </IxIconText>
        <span>，你可以在这里试试</span>
        <IxIconText
          icon-class="i-ph-game-controller translate-y-0.7 bg-[#8dc149]"
          font-class="font-bold text-[#8dc149] b-b-1 b-b-dashed" href="https://games.imba97.cn"
        >
          games.imba97.cn
        </IxIconText>
      </div>
    </li>
  </BaseList>
</template>

<script lang="ts" setup>
import BaseList from './BaseList.vue'
</script>
