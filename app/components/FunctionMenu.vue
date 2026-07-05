<style scoped>
.function-menu-row {
  max-height: 80px;
}

.function-menu-enter-active,
.function-menu-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease, transform 0.25s ease;
  overflow: hidden;
}

.function-menu-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(100%);
}

.function-menu-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(100%);
}
</style>

<template>
  <Transition name="function-menu">
    <div v-if="open" class="function-menu-row">
      <div max-w-3xl mx-auto px-4 py-2 flex items-center justify-start gap-1>
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
/**
 * 移动端"按住输入框上滑"唤出的功能菜单栏。
 * 父组件控制 open 状态；具体功能按钮通过默认 slot 注入。
 * 这样 ChatInput 决定何时开 / 关 + 收到菜单按钮 click 后做什么，
 * 本组件只负责「贴底菜单出现 / 隐藏」的呈现 + transition 动画。
 *
 * 为什么 transition 用 max-height 而不是 height：
 * height: auto 在 CSS 里不可过渡，所以用一个大于自然高度的值（80px）兜底。
 * 80px = py-2(16+16) + size-12(48)；实际自然高度 80px 之内。
 */
defineProps<{
  open: boolean
}>()
</script>
