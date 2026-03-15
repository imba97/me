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

      <div>
        <span>后来匹配器抽离成单独的项目</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/matchinitx">
          matchinitx
        </IxIconText>
        <span>插件系统抽离成了</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/npm-plugin-kit">
          npm-plugin-kit
        </IxIconText>
      </div>
    </li>

    <li>
      <div>
        <span>「从夯到拉」排行榜</span>
        <IxIconText :preset="IconTextPreset.Github" href="imba97/h2l-ranking">
          h2l-ranking
        </IxIconText>
        <span> Vue3 组件，用于我的</span>
        <IxIconText
          icon-class="i-solar-ranking-bold-duotone size-6 bg-colorful"
          href="/ranking"
        >
          <span text-colorful>个人排行</span>
        </IxIconText>
        <span>，以及做了一个</span>
        <IxIconText
          icon-class="i-mingcute-link-2-line"
          href="https://h2l-ranking.netlify.app/"
        >
          网站
        </IxIconText>
        <span>可以上传图片通过拖拽做自己的排行榜</span>
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
        更多开源项目
      </div>
      <div>
        <IxIconText
          v-for="item in moreProjects"
          :key="item.href"
          :preset="IconTextPreset.Github"
          :href="item.href"
        >
          {{ item.name }}
        </IxIconText>
      </div>
    </li>
  </BaseList>
</template>

<script lang="ts" setup>
import BaseList from './BaseList.vue'

const moreProjects = [
  { name: 'iconfontx', href: 'imba97/iconfontx' },
  { name: 'uno-colors', href: 'imba97/uno-colors' },
  { name: 'hexo-unocss', href: 'imba97/hexo-unocss' },
  { name: 'smserialport', href: 'smserialport/smserialport' },
  { name: 'smserialport-electron', href: 'smserialport/smserialport-electron' },
  { name: 'lodash-imports', href: 'imba97/lodash-imports' },
  { name: 'introxd', href: 'introxd/web' },
  { name: 'introxd-components', href: 'introxd/components' },
  { name: 'bsr-project', href: 'bsr-project' }
]
</script>
