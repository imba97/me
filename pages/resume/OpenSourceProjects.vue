<template>
  <ul>
    <li>
      <div>
        <span>写日报太麻烦了，写个</span>
        <IconText
          icon-class="i-logos-github-icon"
          href="https://github.com/imba97/imba97_project/tree/master/dingtalk-report-robot"
        >
          钉钉日报机器人
        </IconText>
        <span>帮我自动从 Git 整理日报，到点儿了自动推给我</span>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
ul {
  li {
    &>div {
      :deep(.icon-text) {
        --uno: relative top-0.58;
      }
    }
  }
}
</style>
