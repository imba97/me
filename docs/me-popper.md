# MePopper 浮层

`app/components/MePopper/index.client.vue`，基于 `@floating-ui/vue`，用来替代原来的 floating-vue `VMenu`（floating-vue 是 Options API 实现，已移除）。

## 用法

```vue
<template>
  <MePopper :distance="16" :skidding="100" placement="right">
    <!-- 默认插槽：触发元素 -->
    <div size-6>
      <div i-ph-music-note-simple-duotone size-full />
    </div>

    <!-- 浮层内容 -->
    <template #popper>
      <div>...</div>
    </template>
  </MePopper>
</template>
```

## Props

| prop | 默认值 | 说明 |
| --- | --- | --- |
| `placement` | `'bottom'` | 浮层相对触发元素的位置（`'right'`、`'bottom'`、`'top-start'` …） |
| `distance` | `16` | 主轴偏移（原 floating-vue 的 `distance`） |
| `skidding` | `0` | 交叉轴偏移（原 floating-vue 的 `skidding`） |
| `showDelay` | `0` | 显示延迟（ms） |
| `hideDelay` | `120` | 隐藏延迟（ms），给「鼠标从触发元素移入浮层」留容错 |

## 视觉（与原 floating-vue 的 dropdown 主题一致）

浮层内层 `.me-popper__inner` 默认：`border-radius: 6px`、`overflow: hidden`（用来把卡片四角裁圆）、白底、`1px solid #ddd` 边框、`0 6px 30px rgb(0 0 0 / 10%)` 阴影；外层 `z-index: 10000`。显示/隐藏是 0.15s opacity 淡入淡出。

需要改样式时覆盖 CSS 变量即可（不必改组件）：

```css
.me-popper__inner {
  --me-popper-radius: 0;
  --me-popper-background: transparent;
  --me-popper-border: none;
  --me-popper-shadow: none;
}
```

## 行为

- 桌面（`pointerType` 为 mouse/pen）悬停显示；触摸设备点击切换；鼠标移入浮层不会闪关。
- 浮层 Teleport 到 `body`，并带 `flip` / `shift`，不会被父级 `overflow: hidden` 裁剪。
- 点击浮层外部、按 `Esc`、触发元素失焦移出后关闭。
- 触发元素是 `role="button" tabindex="0"`，支持 `Enter` / `Space` 开关。

## 保持常开（原来的 `:delay="{ hide: 100000 }"` 技巧）

把隐藏延迟调大即可：

```vue
<MePopper :hide-delay="100000">
  <!-- ... -->
</MePopper>
```
